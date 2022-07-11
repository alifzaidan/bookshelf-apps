const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
const checkInput = document.querySelector('.input-inline');
const searchSubmit = document.getElementById('searchSubmit');

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveDataToStorage() {
    if (isStorageExist()) {
        const bookParsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, bookParsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serailizedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serailizedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete,
    };
}

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const generateID = generateId();
    const bookObject = generateBookObject(generateID, title, author, year, isComplete);
    books.push(bookObject);

    const textSpan = document.getElementById('textSpan');
    if (isComplete == true) {
        document.getElementById('bookSubmit').removeChild(textSpan);
    }

    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputBookAuthor').value = '';
    document.getElementById('inputBookYear').value = '';
    document.getElementById('inputBookIsComplete').checked = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToStorage();
}

function checkFinishReading() {
    const isComplete = document.getElementById('inputBookIsComplete').checked;
    const textSpan = document.getElementById('textSpan');
    if (isComplete == true) {
        textSpan.setAttribute('hidden', undefined);
    } else {
        textSpan.removeAttribute('hidden');
    }
}

function searchBook() {
    const input = document.getElementById('searchBookInput').value.toLowerCase();
    const bookFilter = books.filter((book) => {
        return book.title.toLowerCase() == input;
    });

    if (bookFilter == '') {
        alert('Buku yang anda cari tidak ada!');
    } else {
        for (const bookItem of books) {
            if (bookItem.title !== bookFilter[0].title) {
                console.log(bookItem.id.toString());
                const item = document.getElementById(`book-${bookItem.id}`);
                item.setAttribute('style', 'display: none');
            } else {
                const item = document.getElementById(`book-${bookItem.id}`);
                item.setAttribute('style', 'display: flex');
            }
        }
    }
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function addBookToComplete(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToStorage();
}

function undoBookFromComplete(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToStorage();
}

function deleteBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToStorage();
}

function makeBook(bookObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = bookObject.title;

    const textDescription = document.createElement('p');
    textDescription.innerText = `${bookObject.author}, ${bookObject.year}`;

    const textContainer = document.createElement('div');
    textContainer.classList.add('content');
    textContainer.append(textTitle, textDescription);

    const container = document.createElement('article');
    container.classList.add('book-item');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    if (!bookObject.isComplete) {
        const doneButton = document.createElement('button');
        doneButton.classList.add('button-done');

        doneButton.addEventListener('click', function () {
            addBookToComplete(bookObject.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('button-delete');

        deleteButton.addEventListener('click', function () {
            const val = confirm('Yakin ingin menghapus buku yang belum selesai dibaca?');
            if (val == true) {
                deleteBook(bookObject.id);
            } else {
                return;
            }
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('action');
        buttonContainer.append(doneButton, deleteButton);

        container.append(buttonContainer);
    } else {
        const undoButton = document.createElement('button');
        undoButton.classList.add('button-undo');

        undoButton.addEventListener('click', function () {
            undoBookFromComplete(bookObject.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('button-delete');

        deleteButton.addEventListener('click', function () {
            const val = confirm('Yakin ingin menghapus buku yang sudah selesai dibaca?');
            if (val == true) {
                deleteBook(bookObject.id);
            } else {
                return;
            }
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('action');
        buttonContainer.append(undoButton, deleteButton);

        container.append(buttonContainer);
    }

    return container;
}

checkInput.addEventListener('click', function () {
    checkFinishReading();
});

searchSubmit.addEventListener('click', function (e) {
    searchBook();
    e.preventDefault();
});

document.addEventListener('DOMContentLoaded', function () {
    const submitInputBook = document.getElementById('inputBook');
    submitInputBook.addEventListener('submit', function (e) {
        e.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function () {
    console.log(books);
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    incompleteBookshelfList.innerHTML = '';

    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            incompleteBookshelfList.append(bookElement);
        } else {
            completeBookshelfList.append(bookElement);
        }
    }
});

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});
