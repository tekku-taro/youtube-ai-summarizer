import { Spinner } from './Spinner';

export interface LoadingOverlayProps {
  loading: boolean;
  message?: string;
}

export function LoadingOverlay({
  loading,
  message = 'AIが生成中です...',
}: LoadingOverlayProps) {
  if (!loading) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
      "
    >
      <div
        className="
          rounded-lg
          bg-white
          p-6
          shadow-lg
          flex
          flex-col
          items-center
          gap-4
        "
      >
        <Spinner />

        <p>{message}</p>
      </div>
    </div>
  );
}