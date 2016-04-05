using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using CefSharp;
using CefSharp.WinForms;

namespace linear_algebra_interface {
    public partial class MainForm : Form {

        public ChromiumWebBrowser viewBrowser;
        public ChromiumWebBrowser consoleBrowser;

        public MainForm() {
            InitializeComponent();
        }

        private void MainForm_Load(object sender, EventArgs e) {
            if (!Cef.IsInitialized) {
                CefSettings config = new CefSettings();
                config.RemoteDebuggingPort = 8080; 
                Cef.Initialize(config);
            }

            viewBrowser = new ChromiumWebBrowser("file:///interface/interface.html");
            viewBrowser.Dock = DockStyle.Fill;

            consoleBrowser = new ChromiumWebBrowser("http://localhost:8080");
            consoleBrowser.Dock = DockStyle.Fill;

            this.mainSplitter.Panel1.Controls.Add(viewBrowser);
            this.mainSplitter.Panel2.Controls.Add(consoleBrowser);
        }
    }
}
