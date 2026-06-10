/**
 * testimonials.js
 * -----------------------------------------------
 * CRUD logic for Client Testimonials using LocalStorage.
 * Works together with testimonials.html.
 * -----------------------------------------------
 */

(function () {
  'use strict';

  // ========== CONSTANTS ==========
  const STORAGE_KEY = 'aa_testimonials';
  const isGuest = !localStorage.getItem('token');

  // ========== DOM ELEMENTS ==========
  const form = document.getElementById('testiForm');
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const clientNameInput = document.getElementById('clientName');
  const companyNameInput = document.getElementById('companyName');
  const testiContentInput = document.getElementById('testiContent');
  const listContainer = document.getElementById('testiListContainer');
  const testiCount = document.getElementById('testiCount');
  const toast = document.getElementById('toast');

  // Modal
  const deleteModal = document.getElementById('deleteModal');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');

  // ========== STATE ==========
  let editingId = null;
  let deleteTargetId = null;

  // ========== LOCAL STORAGE HELPERS ==========
  function getTestimonials() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveTestimonials(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  // ========== GENERATE ID ==========
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ========== TOAST ==========
  function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // ========== RENDER LIST ==========
  function render() {
    const data = getTestimonials();
    testiCount.textContent = data.length + ' Testimoni';

    if (data.length === 0) {
      listContainer.innerHTML = `
        <div class="testi-empty">
          <div class="empty-icon">💬</div>
          <p>Belum ada testimoni. Tambahkan testimoni pertama Anda!</p>
        </div>
      `;
      return;
    }

    let tableHTML = `
      <table class="testi-table">
        <thead>
          <tr>
            <th>Nama Klien</th>
            <th>Perusahaan</th>
            <th>Testimoni</th>
            ${isGuest ? '' : '<th style="text-align:center;">Aksi</th>'}
          </tr>
        </thead>
        <tbody>
    `;

    data.forEach((item) => {
      tableHTML += `
        <tr data-id="${item.id}">
          <td data-label="Nama Klien">${escapeHTML(item.clientName)}</td>
          <td data-label="Perusahaan" class="td-company">${escapeHTML(item.companyName)}</td>
          <td data-label="Testimoni" class="td-content">${escapeHTML(item.content)}</td>
          ${isGuest ? '' : `<td data-label="Aksi" class="td-actions" style="text-align:center;">
            <button class="btn-edit" onclick="testiCRUD.edit('${item.id}')">Edit</button>
            <button class="btn-hapus" onclick="testiCRUD.confirmDelete('${item.id}')">Hapus</button>
          </td>`}
        </tr>
      `;
    });

    tableHTML += '</tbody></table>';
    listContainer.innerHTML = tableHTML;
  }

  // ========== ESCAPE HTML ==========
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ========== CREATE ==========
  function createTestimonial(clientName, companyName, content) {
    const list = getTestimonials();
    const newItem = {
      id: generateId(),
      clientName: clientName.trim(),
      companyName: companyName.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newItem);
    saveTestimonials(list);
    return newItem;
  }

  // ========== UPDATE ==========
  function updateTestimonial(id, clientName, companyName, content) {
    const list = getTestimonials();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return null;
    list[index].clientName = clientName.trim();
    list[index].companyName = companyName.trim();
    list[index].content = content.trim();
    list[index].updatedAt = new Date().toISOString();
    saveTestimonials(list);
    return list[index];
  }

  // ========== DELETE ==========
  function deleteTestimonial(id) {
    let list = getTestimonials();
    list = list.filter((item) => item.id !== id);
    saveTestimonials(list);
  }

  // ========== ENTER EDIT MODE ==========
  function enterEditMode(id) {
    const list = getTestimonials();
    const item = list.find((t) => t.id === id);
    if (!item) return;

    editingId = id;
    clientNameInput.value = item.clientName;
    companyNameInput.value = item.companyName;
    testiContentInput.value = item.content;

    formTitle.textContent = 'Edit Testimoni';
    submitBtn.textContent = 'Simpan Perubahan';
    cancelBtn.style.display = 'inline-block';

    // Scroll to form
    document.getElementById('formCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    clientNameInput.focus();
  }

  // ========== EXIT EDIT MODE ==========
  function exitEditMode() {
    editingId = null;
    form.reset();
    formTitle.textContent = 'Tambah Testimoni';
    submitBtn.textContent = 'Tambah Testimoni';
    cancelBtn.style.display = 'none';
  }

  // ========== CONFIRM DELETE ==========
  function openDeleteModal(id) {
    deleteTargetId = id;
    deleteModal.classList.add('show');
  }

  function closeDeleteModal() {
    deleteTargetId = null;
    deleteModal.classList.remove('show');
  }

  // ========== EVENT LISTENERS ==========

  // Form submit (Create or Update) — only for logged-in users
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const clientName = clientNameInput.value.trim();
      const companyName = companyNameInput.value.trim();
      const content = testiContentInput.value.trim();

      if (!clientName || !companyName || !content) {
        showToast('Semua field harus diisi!', 'error');
        return;
      }

      if (editingId) {
        const updated = updateTestimonial(editingId, clientName, companyName, content);
        if (updated) {
          showToast('Testimoni berhasil diperbarui!', 'success');
        } else {
          showToast('Gagal memperbarui testimoni.', 'error');
        }
        exitEditMode();
      } else {
        createTestimonial(clientName, companyName, content);
        showToast('Testimoni baru berhasil ditambahkan!', 'success');
        form.reset();
      }

      render();
    });
  }

  // Cancel edit
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      exitEditMode();
    });
  }

  // Modal confirm delete
  modalConfirmBtn.addEventListener('click', () => {
    if (deleteTargetId) {
      deleteTestimonial(deleteTargetId);
      showToast('Testimoni berhasil dihapus.', 'success');
      // If we were editing the same one, exit edit mode
      if (editingId === deleteTargetId) {
        exitEditMode();
      }
      render();
    }
    closeDeleteModal();
  });

  // Modal cancel
  modalCancelBtn.addEventListener('click', closeDeleteModal);
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  // ========== EXPOSE GLOBAL API FOR INLINE ONCLICK ==========
  window.testiCRUD = {
    edit: enterEditMode,
    confirmDelete: openDeleteModal
  };

  // ========== INITIAL RENDER ==========
  render();
})();
