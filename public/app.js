document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('houseStyleForm');
    const resultDiv = document.getElementById('result');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        try {
            const response = await fetch('http://localhost:3000/analyze', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            resultDiv.innerHTML = `<p><strong>Analysis Result:</strong> ${data.analysis}</p>`;
        } catch (error) {
            console.error('Error:', error);
            resultDiv.innerHTML = `<p>An error occurred: ${error.message}. Please check the console for more details.</p>`;
        }
    });
});