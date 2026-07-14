export function Header() {
  return (
    <header
      className="
        header
        flex
        items-center
        justify-between
        border-b
        px-4
        py-3
      "    
    >

      <h1>
        YouTube AI Assistant
      </h1>

      <button
        type="button"
        aria-label="Close"
      >
        ✕
      </button>

    </header>
  );
}