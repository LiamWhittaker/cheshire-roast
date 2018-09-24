function updatePrice(event) {
  const regularPrice = document.getElementsByClassName('coffee__price--regular')[0];
  const largePrice = document.getElementsByClassName('coffee__price--large')[0];
  const bagsize = event.target.value;

  if (bagsize === 'Regular') {
    regularPrice.classList.remove('hidden');
    largePrice.classList.add('hidden');
  } else {
    regularPrice.classList.add('hidden');
    largePrice.classList.remove('hidden');
  }
}

document.getElementById('buyform').reset();

document.addEventListener(
  'DOMContentLoaded',
  () => {
    document.getElementById('size_1').onchange = updatePrice;
    document.getElementById('size_2').onchange = updatePrice;
  },
  false
);

export default updatePrice;
