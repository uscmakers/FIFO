#include <WiFi.h>
#include <PubSubClient.h>

// ===========================
// WiFi Credentials
// ===========================
const char* ssid = "RakshetaiPhone";
const char* password = "rakshetaK";

// ===========================
// MQTT Broker IP
// ===========================
const char* mqtt_server = "172.20.10.2"; //change based on the server

WiFiClient espClient;
PubSubClient client(espClient);

// ===========================
// Ultrasonic Sensor Pins
// ===========================
const int trigPin = 13;
const int echoPin = 33;

// ===========================
// Door Logic
// ===========================
const int DOOR_CLOSED_THRESHOLD = 7;
const int REQUIRED_STABLE_READS = 5;

int closedCount = 0;
int openCount   = 0;

bool doorIsClosed = false;   // last confirmed state


// =========================================================
// WiFi Setup
// =========================================================
void setup_wifi() {
  delay(10);
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
  Serial.print("ESP32 IP address: ");
  Serial.println(WiFi.localIP());
}


// =========================================================
// MQTT Reconnect
// =========================================================
void reconnect() {
  while (!client.connected()) {
    Serial.println("\nMQTT: Attempting connection...");

    if (client.connect("ESP32_Ultrasonic")) {
      Serial.println("MQTT connected!");
    } else {
      Serial.print("Failed (rc=");
      Serial.print(client.state());
      Serial.println("), retrying in 5 seconds...");
      delay(5000);
    }
  }
}


// =========================================================
// Ultrasonic Distance
// =========================================================
long getDistanceCM() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  long distance = duration * 0.034 / 2;

  return distance;
}


// =========================================================
// Setup
// =========================================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== ESP32 Ultrasonic MQTT Publisher (Only Publish CLOSED Events) ===");

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  setup_wifi();
  client.setServer(mqtt_server, 1883);

  Serial.println("Setup complete.\n");
}


// =========================================================
// Main Loop
// =========================================================
void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  long distance = getDistanceCM();
  Serial.print("Distance: ");
  Serial.println(distance);

  bool readingClosed = (distance <= DOOR_CLOSED_THRESHOLD);

  // ================
  // Filtering logic
  // ================
  if (readingClosed) {
    closedCount++;
    openCount = 0;
  } else {
    openCount++;
    closedCount = 0;
  }

  // ====================================================
  // Confirmed CLOSED (open → closed) event
  // ONLY time we publish
  // ====================================================
  if (!doorIsClosed && closedCount >= REQUIRED_STABLE_READS) {
    doorIsClosed = true;

    Serial.println("DOOR CLOSED");
    client.publish("door/closed", "1");
  }

  // ====================================================
  // Confirmed OPEN (closed → open)
  // DO NOT publish under any condition
  // ====================================================
  if (doorIsClosed && openCount >= REQUIRED_STABLE_READS) {
    doorIsClosed = false;
    Serial.println("DOOR OPEN");
  }

  delay(150);
}
