using UnityEngine;

public class AppLinkManager : MonoBehaviour
{
    // Put your app URL here (custom scheme or universal link)
    [SerializeField] string appURL = "fifo-app://start";

    public void OpenApp()
    {
        if (!string.IsNullOrEmpty(appURL))
        {
            Application.OpenURL(appURL);
            Debug.Log("Opening app: " + appURL);
        }
        else
        {
            Debug.LogWarning("App URL is empty!");
        }
    }
}