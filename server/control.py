import sys
import subprocess
import json
import os
import socket
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout,
    QPushButton, QLineEdit, QLabel, QMessageBox
)

# Get the base folder dynamically (works inside PyInstaller onefile)
if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CONFIG_PATH = os.path.join(BASE_DIR, "config.json")
HOST_PATH = os.path.join(BASE_DIR, "host.py")

class WolfLoomControl(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("WolfLoom Control")
        self.server_process = None

        layout = QVBoxLayout()

        self.start_button = QPushButton("Start Server")
        self.start_button.clicked.connect(self.toggle_server)
        layout.addWidget(self.start_button)

        layout.addWidget(QLabel("Bind Host (optional, root can leave blank):"))
        self.host_input = QLineEdit()
        layout.addWidget(self.host_input)

        layout.addWidget(QLabel("Port (optional, root can leave blank):"))
        self.port_input = QLineEdit()
        layout.addWidget(self.port_input)

        layout.addWidget(QLabel("Display URL Host (leave blank for auto):"))
        self.display_input = QLineEdit()
        layout.addWidget(self.display_input)

        save_button = QPushButton("Save Settings")
        save_button.clicked.connect(self.save_config)
        layout.addWidget(save_button)

        self.status_label = QLabel("Server is stopped.")
        layout.addWidget(self.status_label)

        self.setLayout(layout)
        self.load_config()

    def load_config(self):
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, "r") as f:
                config = json.load(f)
                self.host_input.setText(config.get("host", ""))
                self.port_input.setText(str(config.get("port", "")))
                self.display_input.setText(config.get("display_url", ""))

    def save_config(self):
        try:
            port_val = self.port_input.text().strip()
            config = {
                "host": self.host_input.text().strip(),
                "port": int(port_val) if port_val else "",
                "display_url": self.display_input.text().strip()
            }

            with open(CONFIG_PATH, "w") as f:
                json.dump(config, f, indent=4)

            QMessageBox.information(self, "Saved", "Settings saved successfully!")
        except ValueError:
            QMessageBox.warning(self, "Invalid Input", "Port must be a number or empty.")

    def toggle_server(self):
        if self.server_process and self.server_process.poll() is None:
            self.server_process.terminate()
            self.server_process = None
            self.start_button.setText("Start Server")
            self.status_label.setText("Server stopped.")
        else:
            try:
                host = self.host_input.text().strip() or "0.0.0.0"
                port = self.port_input.text().strip() or "5000"

                # Pass host and port as arguments to host.py
                self.server_process = subprocess.Popen(
                    [sys.executable, HOST_PATH, host, port],
                    cwd=BASE_DIR
                )

                self.start_button.setText("Stop Server")

                display_host = self.display_input.text().strip()
                if not display_host:
                    display_host = "localhost"

                url = f"http://{display_host}:{port}"
                self.status_label.setText(f"Server running at: {url}")

            except Exception as e:
                QMessageBox.critical(self, "Server Error", str(e))


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = WolfLoomControl()
    window.show()
    sys.exit(app.exec())