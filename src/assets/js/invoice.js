window.onload = function () {
  let header = document.querySelector('.page-header');
  let header_hight = Math.round(header.getBoundingClientRect().height) +1;
  document.head.insertAdjacentHTML("beforeend", `<style>@media print { .page-header, .page-header-space { height: ${header_hight}px }</style>`)
  // document.head.insertAdjacentHTML("beforeend", `<style>.page-footer:after { font-size: .6rem; counter-increment: page; content: counter(page) " of " counter(pages); }</style>`)
};
