"""Test: boot live preview of the generated test project (needs npm install)."""
import sys, os, time
sys.path.insert(0, os.path.dirname(__file__))
from core.preview import start_preview, get_preview, stop_preview, _url_ready

out_dir = os.path.join(os.path.dirname(__file__), "outputs", "test-no-key")
pid = "test-no-key"

print(">> starting preview...")
info = start_preview(pid, out_dir, gemini_key="")
print(">> initial:", info.get("status"), "|", info.get("message"))

# Poll until ready or error (npm install can take a while)
t0 = time.time()
while time.time() - t0 < 420:
    info = get_preview(pid)
    st = info.get("status")
    if st in ("ready", "error"):
        break
    if int(time.time() - t0) % 15 == 0:
        print(f"  ... {int(time.time()-t0)}s: {st} — {info.get('message')}")
    time.sleep(5)

print(">> final:", info.get("status"))
print("   frontend:", info.get("frontend_url"))
print("   backend:", info.get("backend_url"))
print("   message:", info.get("message"))
print("   error:", info.get("error"))
if info.get("status") == "ready":
    print(">> frontend reachable:", _url_ready(info["frontend_url"], timeout=10))
    print(">> backend reachable:", _url_ready(info["backend_url"] + "/health", timeout=10))
    print(">> STOPPING preview")
    print(stop_preview(pid))
