import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export type BoundingBox = [number, number, number, number]; // [x, y, width, height]

export interface DetectionResult {
  class: string;
  score: number;
  bbox: BoundingBox;
}

export interface SecurityEvent {
  type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  alert: boolean;
  message: string;
  humanReview?: boolean;
}

export interface AnalysisFrameResult {
  timestamp: number;
  detections: DetectionResult[];
  events: SecurityEvent[];
}

let model: cocoSsd.ObjectDetection | null = null;
let isModelLoading = false;

export async function loadModel() {
  if (model) return model;
  if (isModelLoading) {
    // Wait until model is loaded by another call
    while (isModelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return model;
  }
  
  isModelLoading = true;
  console.log("Loading COCO-SSD model...");
  await tf.ready();
  model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
  isModelLoading = false;
  console.log("COCO-SSD model loaded.");
  return model;
}

export function evaluateRules(detections: DetectionResult[], config: any): SecurityEvent[] {
  const events: SecurityEvent[] = [];
  
  const people = detections.filter(d => d.class === 'person');
  const vehicles = detections.filter(d => ['car', 'truck', 'bus', 'motorcycle'].includes(d.class));
  const bags = detections.filter(d => ['backpack', 'handbag', 'suitcase'].includes(d.class));
  const weapons = detections.filter(d => ['knife', 'scissors', 'baseball bat'].includes(d.class));

  // Crowd Detection
  if (config.enableCrowd && people.length >= config.crowdThreshold) {
    events.push({
      type: "Crowd Risk",
      severity: "Medium",
      alert: true,
      message: `Crowd detected (${people.length} people).`
    });
  }

  // Weapon-like
  if (weapons.length > 0) {
    events.push({
      type: "Weapon-like Object",
      severity: "Critical",
      alert: true,
      humanReview: true,
      message: `Possible weapon-like object detected (${weapons[0].class}).`
    });
  }

  // Basic "Intrusion" / Presence check (If enabled as a simple rule without zones for now)
  if (config.enableIntrusion && people.length > 0) {
    // We would normally check if inside polygon. For now, if rule is strictly on:
    // This is a placeholder; actual zone check needs polygon math.
    // events.push({
    //   type: "Restricted Zone Violation",
    //   severity: "High",
    //   alert: true,
    //   message: "Person detected in scene (zone check required)."
    // });
  }

  if (config.enableVehicles && vehicles.length > 0) {
     events.push({
         type: "Vehicle Obstruction",
         severity: "High",
         alert: true,
         message: `Vehicle detected (${vehicles[0].class}). Check parking rules.`
     });
  }

  // Suspicious item
  if (config.enableAbandoned && bags.length > 0) {
     events.push({
         type: "Possible Abandoned Object",
         severity: "High",
         alert: true,
         humanReview: true,
         message: `Item detected (${bags[0].class}). Check for abandonment.`
     });
  }

  // Violence/Fight Approximation
  if (people.length >= 2) {
    // Check if any two people are extremely close
    for (let i = 0; i < people.length; i++) {
        for (let j = i + 1; j < people.length; j++) {
            const p1 = people[i].bbox;
            const p2 = people[j].bbox;
            // center points
            const c1x = p1[0] + p1[2] / 2;
            const c1y = p1[1] + p1[3] / 2;
            const c2x = p2[0] + p2[2] / 2;
            const c2y = p2[1] + p2[3] / 2;
            
            const dist = Math.sqrt(Math.pow(c1x - c2x, 2) + Math.pow(c1y - c2y, 2));
            if (dist < 50) { // arbitrary close distance threshold
                events.push({
                    type: "Possible Violence",
                    severity: "Critical",
                    alert: true,
                    humanReview: true,
                    message: `Multiple people in very close proximity. Human review recommended.`
                });
                break;
            }
        }
    }
  }

  // Fall/Emergency Approximation
  people.forEach(p => {
     // If height is much smaller than width, person might be on the ground
     if (p.bbox[2] > p.bbox[3] * 1.5) {
         events.push({
             type: "Possible Fall or Emergency",
             severity: "Critical",
             alert: true,
             humanReview: true,
             message: `Person detected in horizontal position. Human review recommended.`
         });
     }
  });

  return events;
}

export async function analyzeFrame(
    imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, 
    timestamp: number,
    config: any
): Promise<AnalysisFrameResult> {
  const detectModel = await loadModel();
  if (!detectModel) throw new Error("Model not loaded");

  const predictions = await detectModel.detect(imageSource);
  
  const events = evaluateRules(predictions, config);

  return {
    timestamp,
    detections: predictions,
    events
  };
}
