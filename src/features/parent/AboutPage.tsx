import { APP_NAME, APP_VERSION, PRODUCER } from "../../appInfo";

export function AboutPage() {
  return (
      <div className="card stack" style={{ textAlign: "center" }}>
        <h1>🍊 {APP_NAME}</h1>
        <p className="text-muted">版本 v{APP_VERSION}</p>
        <p>製作人 {PRODUCER}</p>
      </div>
  );
}
