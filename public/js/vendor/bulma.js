// The following code is based off a toggle menu by @Bradcomp
// source: https://gist.github.com/Bradcomp/a9ef2ef322a8e8017443b626208999c1
(function() {
    var burger = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.nav-menu');

    function closeBurgerMenu () {
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
    }

    burger.addEventListener('click', closeBurgerMenu);
    document.getElementById('filter').addEventListener('click', closeBurgerMenu); // workaround to close nav options on filter button click
})();