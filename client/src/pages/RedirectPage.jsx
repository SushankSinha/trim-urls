import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function RedirectPage() {
  const { code } = useParams();

  useEffect(() => {
    if (code) {
      window.location.href = `${import.meta.env.VITE_BASE_URL}/redirect/${code}`;
    }
  }, [code]);

  return <p>Redirecting...</p>;
}
