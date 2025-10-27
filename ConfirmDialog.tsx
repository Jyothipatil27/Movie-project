import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = "Confirm",
  message = "Are you sure you want to continue?",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-80">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
