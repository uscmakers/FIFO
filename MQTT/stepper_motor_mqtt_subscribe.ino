#include <WiFi.h>
#include <PubSubClient.h>
#include <Stepper.h>

// ===========================
// WiFi Credentials
// ===========================
const char* ssid = "RakshetaiPhone";
const char* password = "rakshetaK";

// ===========================
// MQTT Broker
// ===========================
const char* mqtt_server = "broker.hivemq.com"; //change based on the server

WiFiClient espClient;
PubSubClient client(espClient);

// ===========================
// Stepper Motor Settings (ULN2003)
// ===========================
const int stepsPerRevolution = 2048;

// ULN2003 connections
#define IN1 17
#define IN2 18
#define IN3 21
#define IN4 22

Stepper myStepper(stepsPerRevolution, IN1, IN3, IN2, IN4);

// Motor timing
bool motorRunning = false;
unsigned long motorStartTime = 0;
const unsigned long MOTOR_RUN_TIME = 15000; // 15 seconds

// ===========================
// WiFi Setup
// ===========================
void setup_wifi() {
  Serial.println();
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  int dots = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    dots++;
    if (dots % 10 == 0) Serial.print(" still connecting...");
  }

  Serial.println("\nWiFi connected!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

// ===========================
// MQTT Callback
// ===========================
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.println("\n=== MQTT MESSAGE RECEIVED ===");
  Serial.print("Topic: ");
  Serial.println(topic);

  String msg;
  for (int i = 0; i < length; i++) msg += (char)payload[i];

  Serial.print("Payload: ");
  Serial.println(msg);
  Serial.println("==============================");

  // When ultrasonic triggers door closed
  if (String(topic) == "door/closed" && msg == "1") {
    Serial.println("EVENT: Door Closed Trigger Received!");
    Serial.println("Starting stepper motor for 15 seconds...");
    motorRunning = true;
    motorStartTime = millis();
  }
}

// ===========================
// MQTT Reconnect
// ===========================
void reconnect() {
  while (!client.connected()) {
    Serial.println("\nMQTT: Attempting connection...");

    if (client.connect("ESP32_Stepper")) {
      Serial.println("MQTT connected!");
      client.subscribe("door/closed");
      Serial.println("Subscribed to topic: door/closed");
    } else {
      Serial.print("MQTT connection failed (rc=");
      Serial.print(client.state());
      Serial.println("). Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

// ===========================
// Setup
// ===========================
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== ESP32 STEPPER MQTT SUBSCRIBER STARTING ===");

  myStepper.setSpeed(20); // 5 RPM, safe for ULN2003
  Serial.println("Stepper motor initialized.");

  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  Serial.println("Setup complete.\n");
}

// ===========================
// Loop
// ===========================
void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  if (motorRunning) {
    unsigned long elapsed = millis() - motorStartTime;

    // Print motor status every second
    if (elapsed % 1000 < 50) {
      Serial.print("Motor running... ");
      Serial.print(elapsed / 1000);
      Serial.println(" seconds elapsed");
    }

    if (elapsed < MOTOR_RUN_TIME) {
      myStepper.step(1000);  // smooth stepping
    } else {
      motorRunning = false;
      Serial.println("Stepper motor STOPPED. Completed full 15-second run.");
    }
  }
}
