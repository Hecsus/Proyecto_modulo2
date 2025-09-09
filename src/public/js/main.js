// Lógica global del frontend

/* Inicialización global de tooltips y popovers.
   Propósito: activar ayudas visuales de Bootstrap.
   Entradas: elementos con data-bs-toggle="tooltip" o "popover".
   Salidas: tooltips/popovers visibles.
   Dependencias: Bootstrap 5. */
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => new bootstrap.Popover(el, { trigger: 'hover', html: true }));

/* Popup informativo para operadores numéricos.
   Propósito: avisar cuando se ingresa un número sin operador.
   Entradas: price|stock|min y sus selects asociados.
   Salidas: SweetAlert2 informativo (no bloquea el envío).
   Dependencias: SweetAlert2 y sessionStorage. */
document.querySelectorAll('form[data-search]').forEach(form => {
  form.addEventListener('submit', () => {
    const view = form.getAttribute('data-search');
    const fields = [
      { value: 'price', op: 'priceOp' },
      { value: 'stock', op: 'stockOp' },
      { value: 'min', op: 'minOp' }
    ];
    let shouldAlert = false;
    fields.forEach(f => {
      const val = form.querySelector(`[name="${f.value}"]`).value;
      const op = form.querySelector(`[name="${f.op}"]`).value;
      const key = `swalHint-${view}-${f.value}`; // una vez por vista y campo
      if (val && !op && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        shouldAlert = true;
      }
    });
    if (shouldAlert) {
      Swal.fire({
        icon: 'info',
        title: 'Operador por defecto',
        text: "Selecciona operador (=, ≤, ≥). Si no eliges ninguno, se usa '=' por defecto.",
        confirmButtonText: 'Entendido'
      });
    }
  });
});

/* Confirmación de eliminación con SweetAlert2.
   Propósito: evitar borrados accidentales.
   Entradas: click en elementos .btn-delete o [data-action="delete"].
   Salidas: eliminación solo si el usuario confirma.
   Dependencias: SweetAlert2. */
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
