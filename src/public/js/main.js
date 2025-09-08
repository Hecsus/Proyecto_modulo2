// Lógica global del frontend
console.log('Inventario listo');

// Inicialización de tooltips y popovers
// Se aplica a cualquier elemento con los atributos data-bs-toggle correspondientes
 document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
 document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => new bootstrap.Popover(el, { trigger: 'hover', html: true }));

// Popup informativo de operadores en formularios de búsqueda
// Si un campo numérico tiene valor sin operador seleccionado, muestra SweetAlert
// Solo aparece una vez por sesión y por vista usando sessionStorage
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
