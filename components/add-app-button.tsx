import { useMiniAppContext } from "@/hooks/use-miniapp-context";

export function AddAppButton() {
  const { actions } = useMiniAppContext();
  
  const handleAddApp = async () => {
    if (actions) {
      try {
        await actions.addFrame();
        console.log("App added successfully");
      } catch (error) {
        console.error("Error adding app:", error);
      }
    }
  };
  
  return (
    <button 
      onClick={handleAddApp}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg"
    >
      Add miniMON to get notifications
    </button>
  );
}
