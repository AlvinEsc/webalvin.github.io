document.addEventListener('alpine:init', () => {
    Alpine.data('products', () => ({
        items: [
            {id: 1, name: 'Robusta Brazil', img: '1.jpg', price: 20000},
            {id: 2, name: 'Arabica Blend', img: '2.jpg', price: 25000},
            {id: 3, name: 'Primo Passo', img: '3.jpg', price: 30000},
            {id: 4, name: 'Aceh Gayo', img: '4.jpg', price: 35000},
            {id: 5, name: 'Sumatra Mandheling', img: '5.jpg', price: 40000},
        ],
        showDetail(item) {
            // const itemDetailModal = document.querySelector('#item-detail-modal');
            // itemDetailModal.style.display = 'flex';
            const itemDetailModal = document.querySelector('#item-detail-modal');
            const modalImage = itemDetailModal.querySelector('.modal-content img');
            const modalTitle = itemDetailModal.querySelector('.product-content h3');
            const modalDescription = itemDetailModal.querySelector('.product-content p');
            const modalPrice = itemDetailModal.querySelector('.product-price');
            
            // Setel konten modal sesuai dengan item yang dipilih
            modalImage.src = `img/produk/${item.img}`;
            modalImage.alt = item.name;
            modalTitle.textContent = item.name;
            modalDescription.textContent = "Deskripsi produk belum tersedia.";
            modalPrice.textContent = `IDR ${item.price}`;
            
            // Tampilkan modal
            itemDetailModal.style.display = 'flex';
        }
    }));

    Alpine.store('cart', {
        items: [],
        total: 0,
        quantity: 0,
        add(newItem) {
            //Cek Apakah cart item sama
            const cartItem = this.items.find((item) => item.id === newItem.id);

            //jika belum ada / cart masih kosong
            if (!cartItem) {
                this.items.push({ ...newItem, quantity: 1, total: newItem.price });
                this.total += newItem.price;
                this.quantity++;
            } else {
                //jika barang sudah ada, cek apakah barang beda atau sama dengan yang ada di cart
                this.items = this.items.map((item) => {
                    //jika barang berbeda
                    if (item.id !== newItem.id) {
                        return item;
                    } else {
                        //jika barang sudah ada, tambah quantity dan totalnya
                        item.quantity++;
                        item.total = item.price * item.quantity;
                        this.quantity++;
                        this.total += item.price;
                        return item;
                    }
                });
            }
        },
        remove(id) {
            const cartItem = this.items.find((item) => item.id === id);

            //jika item lebih dari 1
            if (cartItem.quantity > 1) {
                //telusuri 1 1
                this.items = this.items.map((item) => {
                    //jika bukan barang yang diklik
                    if (item.id != id) {
                        return item;
                    } else {
                        item.quantity--;
                        item.total = item.price * item.quantity;
                        this.quantity--;
                        this.total -= item.price;
                        return item;
                    }
                });
            } else if (cartItem.quantity === 1) {
                //jika barangnya sisa 1
                this.items = this.items.filter((item) => item.id !== id);
                this.quantity--;
                this.total -= cartItem.price;
            }
        }
    });
});

//Form Validation
const checkoutButton = document.querySelector('.checkout-button');
checkoutButton.disabled = true;

const form = document.querySelector('#checkoutForm')
form.addEventListener('keyup', function () {
    for(let i = 0; i < form.elements.length; i++) {
        if (form.elements[i].value.length !== 0) {
            checkoutButton.classList.remove('disabled');
            checkoutButton.classList.add('disabled');
        } else {
            return false;
        }
    }
    checkoutButton.disabled = false;
    checkoutButton.classList.remove('disabled');
});

// kirim data ketika tombol checkout diklik
checkoutButton.addEventListener('click', async function(e) {
    e.preventDefault();
    const formData = new FormData(form);
    const data = new URLSearchParams(formData);
    const objData = Object.fromEntries(data);
    // const message = formatMessage(objData);
    // window.open('http://wa.me/6282123364773?text=' + encodeURIComponent(message));

    //minta transaction token menggunakan ajax/ fetch
    try {
        const response = await fetch('php/placeOrder.php', {
            method: 'POST',
            body: data,
        });
        const token = await response.text();
        // console.log(token);
        window.snap.pay(token);
    } catch (error) {
        console.log(error.message);
    }

});

// Format Pesan Whatsapp
const formatMessage = (obj) => {
    return `Data Customer
        Nama: ${obj.name}
        Email: ${obj.email}
        No HP: ${obj.phone}
    Data Pesanan
    ${JSON.parse(obj.items).map((item) => `${item.name} (${item.quantity} x 
        ${rupiah(item.total)}) \n`)}
    TOTAL: ${rupiah(obj.total)}
    Terima Kasih.`
}

//Konversi ke Rupiah
const rupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number);
}