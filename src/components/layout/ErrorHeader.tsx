export function ErrorHeader({error, onClose}:{
  error:string|undefined;
  onClose?: () => void;
}) {
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // デフォルト動作: ブラウザのポップアップウィンドウを閉じる
      window.close();
    }
  };

  return (
    <header
      className="
        flex
        items-center
        justify-between
        border-b
        px-4
        py-3
      "    
    >

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          YouTube AI Assistant
        </h1>
        {error && (
          <p className="font-medium text-red-600">
            エラー：{error}
          </p>
        )}
      </div>

      <button
        type="button"
        aria-label="Close"
        onClick={handleClose}
        className="
          rounded-md
          p-1.5
          text-gray-500
          hover:bg-gray-100
          hover:text-gray-700
          dark:text-gray-400
          dark:hover:bg-gray-800
          dark:hover:text-gray-200
          transition-colors
        "
      >
        ✕
      </button>

    </header>
  );
}