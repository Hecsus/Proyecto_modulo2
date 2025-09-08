// Lógica global del frontend

// Inicializa tooltips y popovers según atributos data-bs-toggle
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => new bootstrap.Popover(el, { trigger: 'hover', html: true }));

// Popup de operadores por defecto en formularios de búsqueda
// Aparece una vez por vista si hay valores numéricos sin operador seleccionado
document.querySelectorAll('form[data-search]').forEach(form => {
  form.addEventListener('submit', () => {
    const key = `swalHint-${form.getAttribute('data-search')}`; // Clave única por vista
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
