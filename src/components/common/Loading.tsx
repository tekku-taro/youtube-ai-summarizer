import { Spinner } from './Spinner';

export interface LoadingProps {
  loading: boolean;
  message?: string;
}

export function Loading({
  loading,
  message = 'AIが生成中です...',
}: LoadingProps) {
  if (!loading) {
    return null;
  }

  return (
    <div
      className="
        h-full
        z-50
        flex
        items-center
        justify-center
      "
    >
      <div
        className="
          rounded-lg
          bg-white
          p-6
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