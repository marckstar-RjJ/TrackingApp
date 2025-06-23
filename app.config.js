export default {
  expo: {
    name: "BOA Tracking",
    slug: "BoaTrackingApp-New",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo_app2.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/logo_boa.png",
      resizeMode: "contain",
      backgroundColor: "#1976D2"
    },
    ios: {
      supportsTablet: true,
      splash: {
        image: "./assets/logo_boa.png",
        resizeMode: "contain",
        backgroundColor: "#1976D2"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/logo_boa.png",
        backgroundColor: "#1976D2"
      },
      splash: {
        image: "./assets/logo_boa.png",
        resizeMode: "contain",
        backgroundColor: "#1976D2"
      },
      edgeToEdgeEnabled: true,
      package: "com.boa.tracking"
    },
    web: {
      favicon: "./assets/logo_boa.png"
    },
    extra: {
      eas: {
        projectId: "9a2037ed-4638-48ac-a2a3-0747db1b6de1"
      }
    },
    plugins: [
      "expo-barcode-scanner"
    ]
  }
}; 