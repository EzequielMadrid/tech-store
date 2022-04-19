//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
//carrito
let cart = [];
//botones
let buttonsDOM = [];

//consiguiendo los productos
class Products {
    async getProducts() {
        try {
            let result = await fetch("./products.json");
            let data = await result.json();

            let products = data.items;
            products = products.map((item) => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image };
            });
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

//mostrando los productos
class UI {
    displayProducts(products) {
        let result = "";
        products.forEach((product) => {
            result += `
                <article class="product">
                    <div class="img-container">
                        <img src=${product.image} alt="product" class="product-img" />
                        <button class="bag-btn" data-id=${product.id}>
                            <i class="fas fa-shopping-cart"></i>
                            Add it
                        </button>
                    </div>
                    <h3>⭐ ${product.title}</h3>
                    <h4>$ ${product.price}</h4>
                </article>
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach((button) => {
            let id = button.dataset.id;
            let inCart = cart.find((item) => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener("click", (e) => {
                e.target.innerText = "In Cart";
                e.target.disabled = true;
                //conseguir producto desde productos
                let cartItem = { ...Storage.getProducts(id), amount: 1 };
                //añadir productos al carrito
                cart = [...cart, cartItem];
                //guardar carrito en local storage
                Storage.saveCart(cart);
                //configurando valores del carritos
                this.setCartValues(cart);
                //mostrando items del carrito
                this.addCartItem(cartItem);
                //ver el carro
                this.showCart();
            });
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map((item) => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
                        <img src=${item.image} alt="product" />
                        <div>
                            <h4>${item.title}</h4>
                            <h5>${item.price}</h5>
                            <span class="remove-item" data-id=${item.id}>remove</span>
                        </div>
                        <div>
                            <i class="fas fa-chevron-up" data-id=${item.id}></i>
                            <p class="item-amount">${item.amount}</p>
                            <i class="fas fa-chevron-down" data-id=${item.id}></i>
                        </div>`;
        cartContent.appendChild(div);
        console.log(cartContent);
    }
    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
    }
    populateCart(cart) {
        cart.forEach((item) => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    cartLogic() {
        //limpiando carrito
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
        });
        //funcionalidad del carrito
        cartContent.addEventListener("click", (e) => {
            if (e.target.classList.contains("remove-item")) {
                //eliminar cualquier item que deseamos
                let removeItem = e.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            } else if (e.target.classList.contains("fa-chevron-up")) {
                let addAmount = e.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find((item) => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (e.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = e.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find((item) => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    removeItem(id);
                }
            }
        });
    }
    // limpiando el carrito para acceder a la compra
    clearCart() {
        let cartItems = cart.map((item) => item.id);
        cartItems.forEach((id) => this.removeItem(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
        //sweet alert
        Swal.fire("CONGRATULATIONS! 🔥", "Thanks for you time!", "success");
    }
    removeItem(id) {
        cart = cart.filter((item) => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        // reescribiendo el botón para que no se pierda su contenido una vez eliminado el item del carrito
        button.innerHTML = `
            <i class = "fas fa-shopping-cart"></i>
            Add it
        `;
    }
    getSingleButton(id) {
        return buttonsDOM.find((button) => button.dataset.id === id);
    }
}

//local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProducts(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find((product) => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    }
}

//eventos
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    //configurando app
    ui.setupAPP();

    //conseguiendo todos los productos
    products
        .getProducts()
        .then((products) => {
            ui.displayProducts(products);
            Storage.saveProducts(products);
        })
        .then(() => {
            ui.getBagButtons();
            ui.cartLogic();
        });
});
