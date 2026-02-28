document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    if (fileInput && uploadForm) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) uploadForm.submit();
        });
    }

    // File ellipsis dropdown
    window.toggleDropdown = function(button) {
        const dropdown = button.nextElementSibling;
        if (!dropdown) return;
        document.querySelectorAll('.file-dropdown.show').forEach(menu => {
            if(menu !== dropdown) menu.classList.remove('show');
        });
        dropdown.classList.toggle('show');
        dropdown.style.zIndex = dropdown.classList.contains('show') ? 9999 : '';
    };
    document.addEventListener('click', e => {
        if(!e.target.closest('.file-menu-container')) {
            document.querySelectorAll('.file-dropdown.show').forEach(menu => {
                menu.classList.remove('show');
                menu.style.zIndex = '';
            });
        }
    });

	window.deleteFile = function(filename) {
		if (!confirm(`Delete "${filename}"?`)) return;

		fetch(`/files/delete/${encodeURIComponent(filename)}`, {
		    method: 'POST'
		}).then(res => {
		    if (res.ok) {
		        document.querySelector(`.file-item[data-filename="${filename}"]`)?.remove();
		    } else {
		        alert('Failed to delete file.');
		    }
		});
	};

    // Download file
    window.downloadFile = function(filename) {
        window.location.href = `/files/data/${encodeURIComponent(filename)}`;
    };

    // Close modals on Escape
    document.addEventListener('keydown', e => { if (e.key === "Escape") closeMenus(); });

    // Click outside dropdowns closes
    document.addEventListener('click', e => {
        if (!e.target.closest('.file-menu-container')) {
            document.querySelectorAll('.file-dropdown').forEach(d => d.classList.remove('show'));
        }
    });
});