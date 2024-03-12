import axios from "axios";

const fileUploadPostApi = async (data) => {
  const idToken = localStorage.getItem("idToken");
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `https://m1kiyejux4.execute-api.us-west-1.amazonaws.com/dev/api/v1/onboarding/tuyaCredentials`,
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    data: {
      tuya_credentials_list: data,
    },
  };
  try {
    const response = await axios.request(config);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export default fileUploadPostApi;
