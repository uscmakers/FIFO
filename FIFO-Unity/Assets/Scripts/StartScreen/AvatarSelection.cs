using TMPro;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class AvatarSelectionManager : MonoBehaviour
{
    public Image selectedPreview;
    public TMP_InputField nameInput;
    public Sprite[] avatarSprites;

    private int selectedAvatar = -1; // -1 = none selected

    public void SelectAvatar(int index)
    {
        selectedAvatar = index;

        selectedPreview.sprite = avatarSprites[index];
        selectedPreview.enabled = true;

        Debug.Log("Selected Avatar: " + index);
    }

    public void ClearSelection()
    {
        selectedAvatar = -1;

        selectedPreview.enabled = false;

        Debug.Log("Avatar selection cleared");
    }

    public void ConfirmSelection()
    {
        Debug.Log("Final Avatar Selected: " + selectedAvatar);

        PlayerPrefs.SetInt("SelectedAvatar", selectedAvatar);
        PlayerPrefs.Save();
    }
    
    public void SubmitSelection()
    {
        Debug.Log("Submit button clicked!");

        string username = nameInput.text;

        if (string.IsNullOrWhiteSpace(username))
        {
            Debug.LogWarning("No username entered.");
            return;
        }

        if (selectedAvatar == -1)
        {
            Debug.LogWarning("No avatar selected.");
            return;
        }

        PlayerPrefs.SetString("Username", username);
        PlayerPrefs.SetInt("SelectedAvatar", selectedAvatar);
        PlayerPrefs.Save();

        Debug.Log("Loading Home scene now...");

        SceneManager.LoadScene("HomeScene");
    }

    void Start()
    {
        if(PlayerPrefs.GetString("Username", "") != "")
        {
            nameInput.text = PlayerPrefs.GetString("Username", "");
        }
        if(PlayerPrefs.GetInt("SelectedAvatar", -1) != -1)
        {
            SelectAvatar(PlayerPrefs.GetInt("SelectedAvatar", -1));
        }
    }
}