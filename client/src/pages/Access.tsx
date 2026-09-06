import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import NeuralAccessLogin from "@/components/ui/neural-access-login";

function safeNextPath(value: string | null) { return value && value.startsWith("/") && !value.startsWith("//") ? value : "/account"; }

export default function Access() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const parameters = new URLSearchParams(window.location.search);
  const nextPath = safeNextPath(parameters.get("next"));
  const mode = parameters.get("mode") === "create" ? "create" : "signin";
  useEffect(() => { if (isAuthenticated) navigate(nextPath); }, [isAuthenticated, navigate, nextPath]);
  if (loading) return <main className="min-h-screen bg-[#080B14]" />;
  return <NeuralAccessLogin nextPath={nextPath} mode={mode} />;
}
