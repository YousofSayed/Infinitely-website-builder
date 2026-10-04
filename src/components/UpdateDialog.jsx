import Portal from "@/components/Editor/Portal";
import { useElectronAppVersion } from "@/hooks/useElectronAppVersion";
import { useEffect, useState } from "react";
export default function UpdateDialog({ open, onClose }) {
  const [status, setStatus] = useState("idle");
  const [update, setUpdate] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const appVersion = useElectronAppVersion();

  const updater = window.electron?.electronUpdater;
  useEffect(() => {
    if (!open || !updater) return;
    const cleanups = [
      updater.onChecking?.(() => {
        setStatus("checking");
        setError("");
      }),
      updater.onAvailable?.((info) => {
        setUpdate(info);
        setStatus("available");
      }),
      updater.onNotAvailable?.(() => {
        setStatus("latest");
      }),
      updater.onProgress?.((info) => {
        setProgress(info?.percent || 0);
        setStatus("downloading");
      }),
      updater.onDownloaded?.((info) => {
        setUpdate(info);
        setProgress(100);
        setStatus("downloaded");
      }),
      updater.onError?.((info) => {
        setError(info?.message || "Failed to update.");
        setStatus("error");
      }),
    ];
    return () => {
      cleanups.forEach((cleanup) => cleanup?.());
    };
  }, [open]);
  if (!open) return null;
  const check = async () => {
    setStatus("checking");
    setError("");
    setUpdate(null);
    setProgress(0);
    await updater?.check();
  };
  const download = async () => {
    setStatus("downloading");
    setProgress(0);
    await updater?.download();
  };
  const install = async () => {
    await updater?.install();
  };
  return (
   <Portal>
     <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-blue-950/40  auto-animate animate-go-to"
        onClick={(ev)=>{
            if(ev.target === ev.currentTarget){
                onClose()
            }
        }}
     >
      {" "}
      <div className=" w-[420px] overflow-hidden rounded-2xl border border-[#475569] bg-[#020617] text-white shadow-2xl ">
        {" "}
        {/* Header */}{" "}
        <div className="flex items-center gap-3 border-b border-[#1e293b] px-5 py-4">
          {" "}
          <img
            src="/brands/infinitely/logo.svg"
            alt="Infinitely Studio"
            className="h-9 w-9"
          />{" "}
          <div className="min-w-0 flex-1">
            {" "}
            <div className="text-sm font-semibold">
              {" "}
              Infinitely Studio{" "}
            </div>{" "}
            <div className="text-xs text-[#e5e7eb]/60">
              {" "}
              Software Update{" "}
            </div>{" "}
          </div>{" "}
          {status !== "checking" && status !== "downloading" && (
            <button
              onClick={onClose}
              className=" rounded-lg px-2 py-1 text-lg text-[#e5e7eb]/50 transition hover:bg-[#1e293b] hover:text-white "
            >
              {" "}
              ×{" "}
            </button>
          )}{" "}
        </div>{" "}
        {/* Content */}{" "}
        <div className="px-5 py-6">
          {" "}
          {/* Idle */}{" "}
          {status === "idle" && (
            <div>
              {" "}
              <h2 className="text-lg font-semibold">
                {" "}
                Check for updates{" "}
              </h2>{" "}
              <p className="mt-2 text-sm text-[#e5e7eb]/60">
                Check if a newer version of Infinitely Studio is available.{" "}
              </p>
              <p className="mt-2 text-sm text-[#e5e7eb]/60">
                Current version: {appVersion}
              </p>
              <button
                onClick={check}
                className=" mt-6 w-full rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-medium transition hover:bg-[#2563eb]/90 active:scale-[0.99] "
              >
                {" "}
                Check for updates{" "}
              </button>{" "}
            </div>
          )}{" "}
          {/* Checking */}{" "}
          {status === "checking" && (
            <div className="py-4 text-center">
              {" "}
              <div className=" mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#475569] border-t-[#2563eb] " />{" "}
              <h2 className="mt-4 text-lg font-semibold">
                {" "}
                Checking for updates{" "}
              </h2>{" "}
              <p className="mt-2 text-sm text-[#e5e7eb]/60">
                {" "}
                Please wait...{" "}
              </p>{" "}
            </div>
          )}{" "}
          {/* Update available */}{" "}
          {status === "available" && (
            <div>
              {" "}
              <div className="rounded-xl border border-[#475569] bg-[#0f172a] p-4">
                {" "}
                <div className="text-xs text-[#e5e7eb]/50">
                  {" "}
                  New version available{" "}
                </div>{" "}
                <div className="mt-1 text-2xl font-semibold">
                  {" "}
                  v{update?.version}{" "}
                </div>{" "}
                <p className="mt-2 text-sm text-[#e5e7eb]/60">
                  {" "}
                  A newer version of Infinitely Studio is ready to
                  download.{" "}
                </p>{" "}
              </div>{" "}
              <button
                onClick={download}
                className=" mt-5 w-full rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-medium hover:bg-[#2563eb]/90 "
              >
                {" "}
                Download update{" "}
              </button>{" "}
            </div>
          )}{" "}
          {/* Downloading */}{" "}
          {status === "downloading" && (
            <div>
              {" "}
              <h2 className="text-lg font-semibold">
                {" "}
                Downloading update{" "}
              </h2>{" "}
              <p className="mt-2 text-sm text-[#e5e7eb]/60">
                {" "}
                Infinitely Studio is downloading the latest version.{" "}
              </p>{" "}
              <div className="mt-6">
                {" "}
                <div className="mb-2 flex justify-between text-xs">
                  {" "}
                  <span className="text-[#e5e7eb]/50">
                    {" "}
                    Downloading...{" "}
                  </span>{" "}
                  <span className="font-medium">
                    {" "}
                    {Math.round(progress)}%{" "}
                  </span>{" "}
                </div>{" "}
                <div className="h-2 overflow-hidden rounded-full bg-[#1e293b]">
                  {" "}
                  <div
                    className="h-full rounded-full bg-[#2563eb] transition-[width] duration-200"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />{" "}
                </div>{" "}
              </div>{" "}
            </div>
          )}{" "}
          {/* Downloaded */}{" "}
          {status === "downloaded" && (
            <div>
              {" "}
              <div className="rounded-xl border border-[#2563eb]/40 bg-[#2563eb]/10 p-4">
                {" "}
                <div className="text-sm font-semibold"> Update ready </div>{" "}
                <div className="mt-1 text-xs text-[#e5e7eb]/60">
                  {" "}
                  Version {update?.version} has been downloaded.{" "}
                </div>{" "}
              </div>{" "}
              <button
                onClick={install}
                className=" mt-5 w-full rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-medium hover:bg-[#2563eb]/90 "
              >
                {" "}
                Restart & Install{" "}
              </button>{" "}
            </div>
          )}{" "}
          {/* Latest */}{" "}
          {status === "latest" && (
            <div className="py-3 text-center">
              {" "}
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0f172a] text-xl">
                {" "}
                ✓{" "}
              </div>{" "}
              <h2 className="mt-4 text-lg font-semibold">
                {" "}
                You’re up to date{" "}
              </h2>{" "}
              <p className="mt-2 text-sm text-[#e5e7eb]/60">
                {" "}
                You already have the latest version of Infinitely Studio.{" "}
              </p>{" "}
              <button
                onClick={onClose}
                className=" mt-6 w-full rounded-xl border border-[#475569] bg-[#0f172a] px-4 py-2.5 text-sm hover:bg-[#1e293b] "
              >
                {" "}
                Done{" "}
              </button>{" "}
            </div>
          )}{" "}
          {/* Error */}{" "}
          {status === "error" && (
            <div>
              {" "}
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                {" "}
                <div className="text-sm font-semibold">
                  {" "}
                  Update failed{" "}
                </div>{" "}
                <div className="mt-2 break-words text-xs text-[#e5e7eb]/60">
                  {" "}
                  {error}{" "}
                </div>{" "}
              </div>{" "}
              <div className="mt-5 flex gap-3">
                {" "}
                <button
                  onClick={onClose}
                  className=" flex-1 rounded-xl border border-[#475569] bg-[#0f172a] px-4 py-2.5 text-sm hover:bg-[#1e293b] "
                >
                  {" "}
                  Close{" "}
                </button>{" "}
                <button
                  onClick={check}
                  className=" flex-1 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-medium hover:bg-[#2563eb]/90 "
                >
                  {" "}
                  Try again{" "}
                </button>{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
   </Portal>
  );
}
