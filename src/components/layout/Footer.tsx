import { Button } from "../ui/button";

export function Footer() {
  return (
    <footer
      className="
        footer
        flex
        justify-between
        border-t
        p-4
        sticky
      "    
    >

      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
      >
        Copy
      </Button>

      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
      >
        Markdown保存
      </Button>

    </footer>
  );
}