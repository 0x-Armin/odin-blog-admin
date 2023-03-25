import { index_router } from "../routes/index";
import { index_controller } from "../controllers/indexController";

// Event listeners
document.querySelectorAll('.togglePublishBtn').forEach((toggleBtn) => {
  toggleBtn.addEventListener('change', function() {
    console.log("toggling");
    index_router.post('/togglePublish', index_controller.toggle_publish_post);
  });
});
