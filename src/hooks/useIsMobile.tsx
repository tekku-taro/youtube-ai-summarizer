import { useEffect, useState } from "react";

 
const MOBILE_BREAKPOINT = 448;
 
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(
    undefined,
  );
 
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    Promise.resolve().then(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    });
    return () => mql.removeEventListener('change', onChange);
  }, []);
 
  return !!isMobile;
}