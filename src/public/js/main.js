// Lógica global del frontend

// Inicializa tooltips y popovers declarados en el HTML (incluye chips de colores)
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => new bootstrap.Popover(el, { trigger: 'hover', html: true }));

// Aviso informativo: cuando se ingresa un número sin operador, recuerda que '=' es el predeterminado
document.querySelectorAll('form[data-search]').forEach(form => {
  form.addEventListener('submit', () => {
    const key = `swalHint-${form.getAttribute('data-search')}`; // Solo una vez por sesión y vista
    const priceVal = form.querySelector('[name="price"]').value;
    const priceOp = form.querySelector('[name="priceOp"]').value;
    const stockVal = form.querySelector('[name="stock"]').value;
    const stockOp = form.querySelector('[name="stockOp"]').value;
    const minVal = form.querySelector('[name="min"]').value;
    const minOp = form.querySelector('[name="minOp"]').value;
    if (!sessionStorage.getItem(key) && ((priceVal && !priceOp) || (stockVal && !stockOp) || (minVal && !minOp))) {
      Swal.fire({
        icon: 'info',
        title: 'Operador por defecto',
        text: "Selecciona operador (=, ≤, ≥). Si no eliges ninguno, se usa '=' por defecto.",
        confirmButtonText: 'Entendido'
      });
      sessionStorage.setItem(key, '1');
    }
  });
});

// Confirmación genérica para enlaces/botones de eliminación
// Usa delegación para cubrir elementos añadidos dinámicamente
document.addEventListener('click', async e => {
  const btn = e.target.closest('.btn-delete,[data-action="delete"]');
  if (!btn) return; // No es un botón de eliminar
  e.preventDefault();
  const href = btn.getAttribute('href'); // Destino en enlaces
  const form = btn.closest('form');      // O formulario contenedor
  const res = await Swal.fire({
    icon: 'warning',
    title: '¿Estás seguro que quieres eliminarlo?',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  });
  if (res.isConfirmed) {
    if (form) form.submit();
    else if (href) window.location.href = href;
  }
});
