// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
});

// Small inline script to toggle long descriptions
// This script is write for show.ejs 
(function () {
  const desc = document.getElementById('listing-description');
  const btn = document.getElementById('desc-toggle');

  if (!desc) return;

  // After DOM loads, check height to decide whether to show toggle
  window.addEventListener('load', function () {
    const maxHeight = 160; // px - same as .collapsed max-height in CSS
    if (desc.scrollHeight > maxHeight) {
      btn.classList.remove('d-none');
      desc.classList.add('collapsed');
    }
  });

  btn.addEventListener('click', function () {
    if (desc.classList.contains('collapsed')) {
      desc.classList.remove('collapsed');
      btn.textContent = 'Show less';
    } else {
      desc.classList.add('collapsed');
      btn.textContent = 'Read more';
      // Smooth scroll back to description top if necessary
      desc.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();


// <!-- ================================ -->
// <!-- SIMPLE JS FOR INLINE EDIT FEATURE -->
// <!-- ================================ -->

(function () {
  const cards = document.querySelectorAll("[data-review-id]");

  cards.forEach(card => {
    const listingId = "<%= listing._id %>";
    const reviewId = card.dataset.reviewId;

    const viewMode = card.querySelector(".view-mode");
    const editMode = card.querySelector(".edit-mode");

    const editBtn = card.querySelector(".edit-btn");
    const cancelBtn = card.querySelector(".cancel-edit");
    const saveBtn = card.querySelector(".save-edit");

    const ratingInput = card.querySelector(".edit-rating");
    const ratingVal = card.querySelector(".rating-val");
    const commentInput = card.querySelector(".edit-comment");

    // Live Rating Update
    ratingInput.addEventListener("input", () => {
      ratingVal.textContent = ratingInput.value;
    });

    // Open Edit
    editBtn.addEventListener("click", () => {
      viewMode.style.display = "none";
      editMode.style.display = "block";
    });

    // Cancel Edit
    cancelBtn.addEventListener("click", () => {
      editMode.style.display = "none";
      viewMode.style.display = "block";
    });

    // Save Edit (PUT request)
    saveBtn.addEventListener("click", async () => {
      const data = {
        review: {
          rating: Number(ratingInput.value),
          comment: commentInput.value.trim()
        }
      };

      try {
        const response = await fetch(`/listings/${listingId}/reviews/${reviewId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
          // Update visible text
          card.querySelector(".review-rating").textContent = result.review.rating;
          card.querySelector(".review-comment").textContent = result.review.comment;

          // Back to view mode
          editMode.style.display = "none";
          viewMode.style.display = "block";
        } else {
          alert("Error updating review.");
        }

      } catch (err) {
        console.error(err);
        alert("Update failed.");
      }
    });

  });
})();

// <!-- ================================ -->
// <!-- SIMPLE JS FOR NAVBAR FILTER SCROLING -->
// <!-- ================================ -->
const wrapper = document.getElementById("categoryWrapper");

function scrollCategories(value) {
  wrapper.scrollLeft += value;
}

document.querySelectorAll(".category").forEach(cat => {
  cat.addEventListener("click", () => {
    document.querySelectorAll(".category")
      .forEach(c => c.classList.remove("active"));
    cat.classList.add("active");
  });
});

// JavaScript (Show / Hide GST text)

const gstToggle = document.getElementById("gstToggle");
const gstTexts = document.querySelectorAll(".gst-text");

gstToggle.addEventListener("change", () => {
  gstTexts.forEach(text => {
    text.style.display = gstToggle.checked ? "inline" : "none";
  });
});





