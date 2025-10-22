from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os

app = FastAPI()

target_dir = "static"

# Check if static directory exists
if os.path.exists(target_dir) and os.path.isdir(target_dir):
    # Mount static files
    app.mount("/", StaticFiles(directory=target_dir, html=True), name="site")
    print(f"✅ Mounted static directory: {target_dir}")
else:
    # Fallback if static directory doesn't exist
    print(f"⚠️ Static directory '{target_dir}' not found!")
    print(f"Current directory: {os.getcwd()}")
    print(f"Files in current directory: {os.listdir('.')}")
    
    @app.get("/")
    def root():
        return HTMLResponse("""
        <html>
            <body style="font-family: Arial; padding: 40px; text-align: center;">
                <h1>⚠️ Static Directory Not Found</h1>
                <p>The 'static' directory is missing.</p>
                <p>Please ensure frontend files are uploaded to the workspace.</p>
                <pre style="background: #f0f0f0; padding: 20px; text-align: left;">
Current directory: {cwd}
Expected: static/
Found: {files}
                </pre>
            </body>
        </html>
        """.format(cwd=os.getcwd(), files=os.listdir('.')))
