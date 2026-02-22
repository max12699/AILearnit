import React, { useEffect, useState } from "react"
import { Plus, Upload, FileText, X } from "lucide-react"
import toast from "react-hot-toast"

import documentService from "../../services/documentService"
import Spinner from "../../components/common/Spinner"
import Button from "../../components/common/Button"
import DocumentCard from "../../components/documents/documentCard"

export default function DocListPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploading, setUploading] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const docs = await documentService.getDocuments()
      setDocuments(docs)
    } catch {
      toast.error("Failed to fetch documents")
    } finally {
      setLoading(false)
    }
  }


  const handleUpload = async (e) => {
    e.preventDefault()

    if (!uploadFile || !uploadTitle) {
      toast.error("Title and file required")
      return
    }

    const tempId = Date.now()

    // optimistic item
    const optimisticDoc = {
      id: tempId,
      title: uploadTitle,
      createdAt: new Date(),
      status: "uploading",
      fileSize: uploadFile.size,
      flashcardCount: 0,
      quizCount: 0
    }

    // show instantly
    setDocuments(prev => [optimisticDoc, ...prev])

    const formData = new FormData()
    formData.append("file", uploadFile)
    formData.append("title", uploadTitle)

    setUploading(true)

    try {
      const newDoc = await documentService.uploadDocument(formData)

      // replace optimistic item with real backend item
      setDocuments(prev =>
        prev.map(d => (d._id === tempId ? newDoc.data : d))
      )

      toast.success("Uploaded successfully")
    } catch {
      toast.error("Upload failed")

      // remove optimistic item
      setDocuments(prev => prev.filter(d => d._id !== tempId))
    } finally {
      setUploading(false)
      setIsUploadModalOpen(false)
      setUploadFile(null)
      setUploadTitle("")
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await documentService.deleteDocument(selectedDoc._id)
      setDocuments(prev => prev.filter(d => d._id !== selectedDoc._id))
      setIsDeleteModalOpen(false)
      toast.success("Deleted successfully")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="min-h-screen p-6 lg:p-10  space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">My Documents</h1>
          <p className="text-slate-900">Manage your AI learning files</p>
        </div>

        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Plus size={18} /> Upload
        </Button>
      </div>

      {/* Documents */}
      {documents.length === 0 ? (
        <div className="h-[50vh] flex flex-col justify-center items-center text-slate-400">
          <FileText size={48} />
          No documents uploaded
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map(doc => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onDelete={(d) => {
                setSelectedDoc(d)
                setIsDeleteModalOpen(true)
              }}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <form
            onSubmit={handleUpload}
            className="bg-slate-900 p-8 rounded-2xl w-full max-w-lg space-y-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Upload New Document
                </h2>
                <p className="text-sm text-slate-400">
                  Add a PDF document to your library
                </p>
              </div>

              <X
                onClick={() => setIsUploadModalOpen(false)}
                className="cursor-pointer text-slate-400 hover:text-white"
              />
            </div>

            {/* Title */}
            <div>
              <label className="text-xs text-slate-400 uppercase">
                Document Title
              </label>
              <input
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. React Interview Prep"
                className="w-full mt-2 px-4 py-3 rounded-lg bg-slate-800 outline-none text-white"
              />
            </div>

            {/* Drag Drop */}
            <label className="block border-2 border-dashed border-slate-700 rounded-xl p-10 text-center cursor-pointer hover:border-emerald-500 transition">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-3">
                <div className="bg-emerald-500/20 p-4 rounded-xl text-emerald-400">
                  <Upload size={28} />
                </div>

                <p className="text-slate-300">
                  <span className="text-emerald-400 font-medium">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-slate-500">PDF up to 10MB</p>

                {uploadFile && (
                  <p className="text-xs text-emerald-400 mt-2">
                    {uploadFile.name}
                  </p>
                )}
              </div>
            </label>

            {/* Footer buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-5 py-2 rounded-lg bg-slate-700 text-white"
              >
                Cancel
              </button>

              <Button
                type="submit"
                loading={uploading}
                disabled={uploading}
                className="px-6"
              >
                Upload
              </Button>
            </div>
          </form>
        </div>
      )}


      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-slate-900 p-6 rounded-xl space-y-4">
            <p>Delete "{selectedDoc?.title}"?</p>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
