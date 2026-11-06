'use client';

import React, { useState } from 'react';
import { usePortal } from '@/context/PortalContext';
import {
  FolderLock,
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  Shield,
  FileCheck,
  Building,
  User,
  Plus,
  Eye,
  Printer,
  X
} from 'lucide-react';
import { DocumentRecord, DocumentCategory } from '@/lib/types';

export default function DocumentsModule() {
  const { db, currentUser, dispatch, showToast } = usePortal();

  const isEmployee = currentUser.role === 'EMPLOYEE';
  const isLineManager = currentUser.role === 'LINE_MANAGER';
  const isHRAdmin = currentUser.role === 'HR_ADMIN';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(isEmployee ? 'CERTIFICATE' : 'POLICY');
  const [fileType, setFileType] = useState('PDF');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [isCompanyWide, setIsCompanyWide] = useState(!isEmployee);
  const [targetEmployeeId, setTargetEmployeeId] = useState(isEmployee ? currentUser.id : '');
  const [description, setDescription] = useState('');

  if (!db) return null;

  const filteredDocs = db.documents.filter(d => {
    // RBAC Confidentiality Enforcement:
    if (isEmployee) {
      const isMine = d.employeeId === currentUser.id;
      const isPublic = d.isCompanyWide;
      if (!isMine && !isPublic) return false;
    } else if (isLineManager) {
      const emp = d.employeeId ? db.employees.find(e => e.id === d.employeeId) : null;
      const isDeptMember = emp && emp.departmentId === currentUser.departmentId;
      const isMine = d.employeeId === currentUser.id;
      const isPublic = d.isCompanyWide;
      if (!isMine && !isPublic && !isDeptMember) return false;
    }

    const matchCat = filterCategory === 'ALL' || d.category === filterCategory;
    const q = search.toLowerCase();
    const matchSearch =
      d.title.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCompanyWide = isEmployee ? false : isCompanyWide;
    const finalEmpId = isEmployee ? currentUser.id : (finalCompanyWide ? undefined : targetEmployeeId);

    const res = await dispatch('UPLOAD_DOCUMENT', {
      title,
      category,
      fileType,
      fileSize,
      isCompanyWide: finalCompanyWide,
      employeeId: finalEmpId,
      downloadUrl: `/docs/${title.replace(/\s+/g, '_')}.${fileType.toLowerCase()}`,
      description
    });
    if (res.success) {
      showToast('Document securely uploaded to vault', 'success');
      setShowUploadModal(false);
      setTitle('');
      setDescription('');
    }
  };

  const handleDelete = async (docId: string) => {
    if (confirm('Are you sure you want to delete this document from the vault?')) {
      const res = await dispatch('DELETE_DOCUMENT', { id: docId });
      if (res.success) {
        showToast('Document removed', 'info');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Institutional Document Vault</h2>
          <p className="text-xs text-slate-500">
            Secure regulatory repository for diplomatic charters, appointment letters, HR policies, and employee dossiers
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-cisd-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-cisd-navy-800 shadow transition self-start sm:self-auto"
        >
          <Upload className="h-4 w-4 text-cisd-gold-400" />
          {isEmployee ? 'Upload Personal Credential' : 'Upload Document'}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search policies, contracts, forms..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700"
          >
            <option value="ALL">All Vault Categories</option>
            <option value="POLICY">Institutional Policies</option>
            <option value="CONTRACT">Executive Contracts</option>
            <option value="APPOINTMENT_LETTER">Appointment Letters</option>
            <option value="FORM">Administrative Forms</option>
            <option value="CERTIFICATE">Certifications & Badges</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => {
          const emp = doc.employeeId ? db.employees.find(e => e.id === doc.employeeId) : null;
          return (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-cisd-navy-300 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-cisd-navy-50 p-2 text-cisd-navy-900">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                      {doc.category.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">
                    {doc.fileType} &bull; {doc.fileSize}
                  </span>
                </div>

                <h3
                  onClick={() => setPreviewDoc(doc)}
                  className="font-bold text-slate-900 text-sm leading-snug cursor-pointer hover:text-cisd-navy-800"
                >
                  {doc.title}
                </h3>
                {doc.description && (
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{doc.description}</p>
                )}

                <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-400">
                  {doc.isCompanyWide ? (
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Building className="h-3 w-3 text-cisd-gold-600" />
                      Institutional (All Staff Access)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-cisd-navy-900 font-medium">
                      <User className="h-3 w-3 text-cisd-navy-700" />
                      Confidential: {emp?.firstName} {emp?.lastName}
                    </span>
                  )}
                  <span className="block text-[10px] text-slate-400 mt-0.5">Uploaded {doc.uploadedDate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="flex items-center gap-1 font-bold text-cisd-navy-900 hover:text-cisd-gold-600 transition"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview Document
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-cisd-navy-900 transition"
                    title="Direct Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>

                  {currentUser.role === 'SUPER_ADMIN' && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete Document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Upload to Secure Document Vault</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CISD Financial Delegations Policy 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="POLICY">Institutional Policy</option>
                    <option value="CONTRACT">Employment Contract</option>
                    <option value="APPOINTMENT_LETTER">Appointment Letter</option>
                    <option value="FORM">Operational Form</option>
                    <option value="CERTIFICATE">Certificate / Diploma</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Format</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">Word (.docx)</option>
                    <option value="XLSX">Spreadsheet (.xlsx)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brief Description / Scope</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of document purpose..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                {!isEmployee ? (
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="compWide"
                        checked={isCompanyWide}
                        onChange={(e) => setIsCompanyWide(e.target.checked)}
                        className="rounded border-slate-300 text-cisd-navy-900"
                      />
                      <label htmlFor="compWide" className="text-slate-700 font-semibold">Institutional / Company-Wide Document</label>
                    </div>

                    {!isCompanyWide && (
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Confidential Target Staff Member</label>
                        <select
                          value={targetEmployeeId}
                          onChange={(e) => setTargetEmployeeId(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                        >
                          <option value="">Select Employee...</option>
                          {db.employees.map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg bg-slate-50 p-2.5 text-slate-600 border border-slate-200 text-[11px]">
                    This document will be securely stored in your personal personnel vault ({currentUser.firstName} {currentUser.lastName}) and accessible to HR & Executive Audit.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-cisd-navy-950 to-cisd-navy-900 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <FileCheck className="h-5 w-5 text-cisd-gold-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">{previewDoc.title}</h3>
                  <span className="text-[11px] text-slate-300">
                    {previewDoc.category} &bull; {previewDoc.fileType} &bull; {previewDoc.fileSize}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-white/70 hover:text-white text-lg leading-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Document Vault Dossier</span>
                <p className="font-bold text-slate-900 text-sm">{previewDoc.title}</p>
                <p className="text-slate-600 leading-relaxed">
                  {previewDoc.description || 'Official institutional documentation certified by the Centre for International Strategic Dialogue.'}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                  <span>Uploaded: <strong className="text-slate-800">{previewDoc.uploadedDate}</strong></span>
                  <span>Classification: <strong className="text-cisd-navy-900">{previewDoc.isCompanyWide ? 'Public Institutional' : 'Strictly Confidential'}</strong></span>
                </div>
              </div>

              {/* Simulated Document Preview Page */}
              <div className="rounded-xl border border-slate-300 bg-white p-6 shadow-inner space-y-3 font-serif text-slate-800 leading-relaxed text-xs">
                <div className="text-center border-b pb-3 space-y-1">
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">Centre for International Strategic Dialogue</h4>
                  <p className="text-[10px] text-slate-500 font-sans">Diplomatic Enclave &bull; Abuja, Nigeria</p>
                </div>
                <p className="text-justify indent-4">
                  This electronic instrument certifies the record and archiving of <span className="font-bold">{previewDoc.title}</span> within the official CISD institutional governance archives under document reference <span className="font-mono font-bold text-cisd-navy-900">{previewDoc.id}</span>.
                </p>
                <p className="text-justify indent-4">
                  Authorized personnel may retrieve and cite this record subject to the non-disclosure protocols set forth in the CISD Institutional Charter.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Printer className="h-4 w-4" />
                  Print Document
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="rounded-lg border px-4 py-2 text-slate-600 hover:bg-slate-50"
                  >
                    Close Preview
                  </button>
                  <a
                    href={previewDoc.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-cisd-navy-900 px-4 py-2 font-bold text-white hover:bg-cisd-navy-800 shadow"
                  >
                    <Download className="h-4 w-4 text-cisd-gold-400" />
                    Download File
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
