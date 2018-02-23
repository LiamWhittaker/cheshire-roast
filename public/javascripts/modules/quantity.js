const dec = document.querySelector('#quantity--dec');
const inc = document.querySelector('#quantity--inc');
const quantity = document.querySelector('#quantity');

if (dec) {
  dec.addEventListener('click', () => {
    if (quantity.value > 1) {
      quantity.value--;
    }
  });

  inc.addEventListener('click', () => {
    if (quantity.value < 10) {
      quantity.value++;
    }
  });
}

