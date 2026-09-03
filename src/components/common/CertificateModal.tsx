import React from 'react';
import { Award, CheckCircle2, Download, Printer, Shield, X } from 'lucide-react';
import { Certificate } from '../../types';

interface CertificateModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, isOpen, onClose }) => {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="no-print absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Frame */}
        <div className="border-8 border-double border-indigo-900/20 p-8 rounded-2xl bg-gradient-to-b from-slate-50/50 via-white to-indigo-50/30 relative">
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Award className="w-96 h-96 text-indigo-950" />
          </div>

          {/* Certificate Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold tracking-widest uppercase mb-3">
              <Award className="w-4 h-4 text-indigo-600" />
              Official Verification Credential
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Certificate of Completion
            </h1>
            <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-medium">
              Software Engineering Technical Onboarding Program
            </p>
          </div>

          {/* Recipient */}
          <div className="my-8 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">This is proudly presented to</p>
            <h2 className="text-3xl font-bold text-blue-700 mt-2 font-display underline decoration-blue-200 underline-offset-8">
              {certificate.developerName}
            </h2>
            <p className="text-sm text-slate-600 mt-4 max-w-xl mx-auto leading-relaxed">
              for successfully completing all mandatory engineering milestones, assessments, and practical tasks for:
            </p>
            <p className="text-lg font-bold text-slate-800 mt-1">
              "{certificate.programName}"
            </p>
          </div>

          {/* Skills Acquired Chips */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
              Validated Competencies & Technical Skills
            </h4>
            <div className="flex flex-wrap justify-center gap-2">
              {certificate.skillsAcquired.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Signatures and Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200 items-end text-center sm:text-left">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Issue Date</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{certificate.issueDate}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center justify-center sm:justify-start gap-1">
                <Shield className="w-3.5 h-3.5" /> Grade: {certificate.grade}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border-4 border-white shadow-md flex items-center justify-center">
                <Award className="w-8 h-8 text-amber-900" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">OnboardPro Certified</p>
            </div>

            <div className="text-center sm:text-right">
              <div className="font-serif italic text-lg text-slate-800 font-semibold border-b border-slate-300 pb-1 inline-block">
                Alex Morgan
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">{certificate.managerSignature}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {certificate.certificateNumber}</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="no-print flex items-center justify-between gap-4 mt-6">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Cryptographic Verification Code: <strong className="font-mono text-slate-700">{certificate.verificationCode}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Certificate
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
