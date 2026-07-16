export function Header({isYoutubePage}:{
  isYoutubePage:boolean;
}) {
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
        {!isYoutubePage && (
          <p className="font-medium text-red-600">
            Youtube サイトの動画ページを開いてください。
          </p>
        )}
      </div>

      <button
        type="button"
        aria-label="Close"
      >
        ✕
      </button>

    </header>
  );
}