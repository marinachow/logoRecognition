document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var formData = new FormData();
    var imageFile = document.querySelector('input[type="file"]').files[0];
    formData.append("file", imageFile);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(result => {
        document.getElementById('result').textContent = result;
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
