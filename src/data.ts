export interface Village {
  id: number;
  name: string;
  province: string;
  lat: number;
  lng: number;
  risk: 'critical' | 'high' | 'medium' | 'low';
  pm25: number;
  water: 'Safe' | 'Moderate' | 'Unsafe';
  chemical: number;
  disease: string;
  prediction: string;
  population: number;
}

export const VILLAGES: Village[] = [
  // ── ภาคเหนือ ──
  { id: 1, name: "บ้านหนองผา", province: "เชียงราย", lat: 19.91, lng: 99.83, risk: "critical", pm25: 142, water: "Unsafe", chemical: 85, disease: "โรคทางเดินหายใจ", prediction: "11 วัน", population: 312 },
  { id: 2, name: "บ้านแม่แจ่ม", province: "เชียงใหม่", lat: 18.50, lng: 98.35, risk: "critical", pm25: 165, water: "Moderate", chemical: 30, disease: "ปอดอักเสบ", prediction: "5 วัน", population: 445 },
  { id: 3, name: "บ้านแม่สะเรียง", province: "แม่ฮ่องสอน", lat: 17.99, lng: 97.93, risk: "high", pm25: 104, water: "Safe", chemical: 38, disease: "ระบบหายใจ", prediction: "8 วัน", population: 334 },
  { id: 4, name: "บ้านเด่นชัย", province: "แพร่", lat: 17.98, lng: 100.04, risk: "medium", pm25: 63, water: "Safe", chemical: 44, disease: "ภูมิแพ้", prediction: "17 วัน", population: 456 },
  { id: 5, name: "บ้านน้ำปาด", province: "อุตรดิตถ์", lat: 17.74, lng: 100.72, risk: "medium", pm25: 58, water: "Moderate", chemical: 51, disease: "โรคตา", prediction: "20 วัน", population: 267 },
  { id: 6, name: "บ้านลำปาง", province: "ลำปาง", lat: 18.30, lng: 99.49, risk: "high", pm25: 95, water: "Moderate", chemical: 58, disease: "ระบบหายใจ", prediction: "11 วัน", population: 723 },
  { id: 7, name: "บ้านนาน้อย", province: "น่าน", lat: 18.56, lng: 100.77, risk: "medium", pm25: 60, water: "Safe", chemical: 40, disease: "โรคพยาธิ", prediction: "23 วัน", population: 289 },
  { id: 8, name: "บ้านลำพูน", province: "ลำพูน", lat: 18.58, lng: 99.01, risk: "medium", pm25: 70, water: "Safe", chemical: 35, disease: "ภูมิแพ้", prediction: "15 วัน", population: 312 },
  { id: 9, name: "บ้านพะเยา", province: "พะเยา", lat: 19.17, lng: 99.90, risk: "high", pm25: 85, water: "Moderate", chemical: 42, disease: "ระบบหายใจ", prediction: "12 วัน", population: 245 },
  // ── ภาคกลาง ──
  { id: 10, name: "บ้านคลองลาน", province: "กำแพงเพชร", lat: 16.17, lng: 99.32, risk: "medium", pm25: 74, water: "Moderate", chemical: 68, disease: "สารพิษ", prediction: "21 วัน", population: 421 },
  { id: 11, name: "บ้านบึงสามพัน", province: "เพชรบูรณ์", lat: 16.01, lng: 101.12, risk: "high", pm25: 82, water: "Unsafe", chemical: 71, disease: "สารเคมีเกษตร", prediction: "12 วัน", population: 534 },
  { id: 12, name: "บ้านหนองบัว", province: "นครสวรรค์", lat: 15.72, lng: 100.44, risk: "medium", pm25: 65, water: "Moderate", chemical: 56, disease: "โรคผิวหนัง", prediction: "16 วัน", population: 623 },
  { id: 13, name: "บ้านอุทัยธานี", province: "อุทัยธานี", lat: 15.38, lng: 100.03, risk: "medium", pm25: 62, water: "Moderate", chemical: 50, disease: "ท้องร่วง", prediction: "19 วัน", population: 456 },
  { id: 14, name: "บ้านบ้านหมี่", province: "ลพบุรี", lat: 14.92, lng: 100.41, risk: "high", pm25: 79, water: "Unsafe", chemical: 73, disease: "โรคพยาธิ", prediction: "10 วัน", population: 512 },
  { id: 15, name: "บ้านสิงห์บุรี", province: "สิงห์บุรี", lat: 14.89, lng: 100.40, risk: "medium", pm25: 55, water: "Moderate", chemical: 48, disease: "ภูมิแพ้", prediction: "22 วัน", population: 334 },
  { id: 16, name: "บ้านอ่างทอง", province: "อ่างทอง", lat: 14.59, lng: 100.46, risk: "low", pm25: 32, water: "Safe", chemical: 25, disease: "ต่ำ", prediction: "—", population: 289 },
  { id: 17, name: "บ้านสุพรรณบุรี", province: "สุพรรณบุรี", lat: 14.47, lng: 100.12, risk: "medium", pm25: 58, water: "Moderate", chemical: 54, disease: "โรคตา", prediction: "20 วัน", population: 467 },
  { id: 18, name: "บ้านชัยนาท", province: "ชัยนาท", lat: 15.18, lng: 100.12, risk: "medium", pm25: 52, water: "Safe", chemical: 45, disease: "ท้องร่วง", prediction: "18 วัน", population: 312 },
  { id: 19, name: "บ้านสระบุรี", province: "สระบุรี", lat: 14.53, lng: 100.91, risk: "high", pm25: 88, water: "Moderate", chemical: 65, disease: "ระบบหายใจ", prediction: "9 วัน", population: 543 },
  { id: 20, name: "บ้านอยุธยา", province: "พระนครศรีอยุธยา", lat: 14.35, lng: 100.57, risk: "high", pm25: 76, water: "Unsafe", chemical: 58, disease: "โรคผิวหนัง", prediction: "11 วัน", population: 612 },
  { id: 21, name: "บ้านปทุมธานี", province: "ปทุมธานี", lat: 14.02, lng: 100.72, risk: "medium", pm25: 68, water: "Moderate", chemical: 52, disease: "ภูมิแพ้", prediction: "14 วัน", population: 789 },
  { id: 22, name: "บ้านนนทบุรี", province: "นนทบุรี", lat: 13.86, lng: 100.51, risk: "medium", pm25: 71, water: "Safe", chemical: 40, disease: "โรคตา", prediction: "16 วัน", population: 854 },
  { id: 23, name: "บ้านกรุงเทพ", province: "กรุงเทพมหานคร", lat: 13.75, lng: 100.50, risk: "high", pm25: 82, water: "Safe", chemical: 30, disease: "ระบบหายใจ", prediction: "7 วัน", population: 1200 },
  { id: 24, name: "บ้านสมุทรปราการ", province: "สมุทรปราการ", lat: 13.60, lng: 100.60, risk: "high", pm25: 85, water: "Unsafe", chemical: 75, disease: "สารพิษอุตสาหกรรม", prediction: "8 วัน", population: 943 },
  { id: 25, name: "บ้านสมุทรสาคร", province: "สมุทรสาคร", lat: 13.55, lng: 100.27, risk: "high", pm25: 84, water: "Unsafe", chemical: 78, disease: "โรคผิวหนัง", prediction: "9 วัน", population: 712 },
  { id: 26, name: "บ้านสมุทรสงคราม", province: "สมุทรสงคราม", lat: 13.41, lng: 100.00, risk: "medium", pm25: 54, water: "Safe", chemical: 35, disease: "ท้องร่วง", prediction: "20 วัน", population: 212 },
  { id: 27, name: "บ้านนครปฐม", province: "นครปฐม", lat: 13.82, lng: 100.05, risk: "medium", pm25: 66, water: "Moderate", chemical: 61, disease: "สารเคมีเกษตร", prediction: "18 วัน", population: 598 },
  { id: 28, name: "บ้านราชบุรี", province: "ราชบุรี", lat: 13.54, lng: 99.82, risk: "medium", pm25: 61, water: "Moderate", chemical: 55, disease: "ท้องร่วง", prediction: "17 วัน", population: 423 },
  { id: 29, name: "บ้านกาญจนบุรี", province: "กาญจนบุรี", lat: 14.00, lng: 99.55, risk: "low", pm25: 26, water: "Safe", chemical: 19, disease: "ต่ำ", prediction: "—", population: 345 },
  { id: 30, name: "บ้านเพชรบุรี", province: "เพชรบุรี", lat: 13.11, lng: 99.94, risk: "low", pm25: 21, water: "Safe", chemical: 14, disease: "ต่ำ", prediction: "—", population: 388 },
  { id: 31, name: "บ้านประจวบ", province: "ประจวบคีรีขันธ์", lat: 11.81, lng: 99.79, risk: "low", pm25: 24, water: "Safe", chemical: 12, disease: "ต่ำ", prediction: "—", population: 412 },
  { id: 32, name: "บ้านตาก", province: "ตาก", lat: 16.88, lng: 99.12, risk: "high", pm25: 92, water: "Moderate", chemical: 45, disease: "ระบบหายใจ", prediction: "10 วัน", population: 321 },
  { id: 33, name: "บ้านสุโขทัย", province: "สุโขทัย", lat: 17.01, lng: 99.82, risk: "medium", pm25: 68, water: "Safe", chemical: 55, disease: "ภูมิแพ้", prediction: "15 วัน", population: 289 },
  { id: 34, name: "บ้านพิษณุโลก", province: "พิษณุโลก", lat: 16.82, lng: 100.26, risk: "medium", pm25: 72, water: "Moderate", chemical: 48, disease: "โรคตา", prediction: "18 วัน", population: 534 },
  { id: 35, name: "บ้านพิจิตร", province: "พิจิตร", lat: 16.44, lng: 100.35, risk: "medium", pm25: 64, water: "Safe", chemical: 62, disease: "สารเคมีเกษตร", prediction: "20 วัน", population: 312 },
  // ── ภาคตะวันออก ──
  { id: 36, name: "บ้านฉะเชิงเทรา", province: "ฉะเชิงเทรา", lat: 13.69, lng: 101.07, risk: "medium", pm25: 62, water: "Moderate", chemical: 50, disease: "โรคผิวหนัง", prediction: "19 วัน", population: 456 },
  { id: 37, name: "บ้านชลบุรี", province: "ชลบุรี", lat: 13.36, lng: 100.99, risk: "medium", pm25: 64, water: "Moderate", chemical: 52, disease: "โรคผิวหนัง", prediction: "16 วัน", population: 678 },
  { id: 38, name: "บ้านระยอง", province: "ระยอง", lat: 12.68, lng: 101.27, risk: "high", pm25: 91, water: "Unsafe", chemical: 80, disease: "สารพิษอุตสาหกรรม", prediction: "7 วัน", population: 534 },
  { id: 39, name: "บ้านจันทบุรี", province: "จันทบุรี", lat: 12.61, lng: 102.11, risk: "medium", pm25: 44, water: "Safe", chemical: 36, disease: "ภูมิแพ้", prediction: "21 วัน", population: 312 },
  { id: 40, name: "บ้านตราด", province: "ตราด", lat: 12.24, lng: 102.52, risk: "low", pm25: 19, water: "Safe", chemical: 12, disease: "ต่ำ", prediction: "—", population: 267 },
  { id: 41, name: "บ้านปราจีนบุรี", province: "ปราจีนบุรี", lat: 14.05, lng: 101.37, risk: "medium", pm25: 58, water: "Moderate", chemical: 55, disease: "โรคตา", prediction: "20 วัน", population: 389 },
  { id: 42, name: "บ้านสระแก้ว", province: "สระแก้ว", lat: 13.81, lng: 102.07, risk: "medium", pm25: 52, water: "Safe", chemical: 48, disease: "ท้องร่วง", prediction: "22 วัน", population: 334 },
  // ── ภาคตะวันออกเฉียงเหนือ ──
  { id: 43, name: "บ้านนครราชสีมา", province: "นครราชสีมา", lat: 14.97, lng: 102.10, risk: "medium", pm25: 69, water: "Moderate", chemical: 59, disease: "โรคพยาธิ", prediction: "15 วัน", population: 723 },
  { id: 44, name: "บ้านบุรีรัมย์", province: "บุรีรัมย์", lat: 14.99, lng: 103.10, risk: "high", pm25: 78, water: "Unsafe", chemical: 75, disease: "โรคพยาธิ", prediction: "12 วัน", population: 378 },
  { id: 45, name: "บ้านสุรินทร์", province: "สุรินทร์", lat: 14.88, lng: 103.49, risk: "high", pm25: 74, water: "Moderate", chemical: 67, disease: "ระบบทางเดินอาหาร", prediction: "10 วัน", population: 523 },
  { id: 46, name: "บ้านศรีสะเกษ", province: "ศรีสะเกษ", lat: 15.11, lng: 104.32, risk: "high", pm25: 72, water: "Unsafe", chemical: 62, disease: "โรคพยาธิ", prediction: "11 วัน", population: 412 },
  { id: 47, name: "บ้านอุบลราชธานี", province: "อุบลราชธานี", lat: 15.23, lng: 104.85, risk: "critical", pm25: 42, water: "Unsafe", chemical: 68, disease: "โรคฉี่หนู", prediction: "6 วัน", population: 634 },
  { id: 48, name: "บ้านยโสธร", province: "ยโสธร", lat: 15.79, lng: 104.14, risk: "medium", pm25: 48, water: "Moderate", chemical: 50, disease: "ท้องร่วง", prediction: "18 วัน", population: 245 },
  { id: 49, name: "บ้านชัยภูมิ", province: "ชัยภูมิ", lat: 15.81, lng: 102.03, risk: "high", pm25: 80, water: "Unsafe", chemical: 72, disease: "สารเคมีเกษตร", prediction: "9 วัน", population: 512 },
  { id: 50, name: "บ้านอำนาจเจริญ", province: "อำนาจเจริญ", lat: 15.86, lng: 104.63, risk: "medium", pm25: 50, water: "Moderate", chemical: 48, disease: "โรคพยาธิ", prediction: "21 วัน", population: 278 },
  { id: 51, name: "บ้านหนองบัวลำภู", province: "หนองบัวลำภู", lat: 17.20, lng: 102.44, risk: "medium", pm25: 55, water: "Safe", chemical: 60, disease: "สารเคมีเกษตร", prediction: "19 วัน", population: 234 },
  { id: 52, name: "บ้านขอนแก่น", province: "ขอนแก่น", lat: 16.43, lng: 102.83, risk: "medium", pm25: 61, water: "Moderate", chemical: 55, disease: "โรคตา", prediction: "18 วัน", population: 198 },
  { id: 53, name: "บ้านอุดรธานี", province: "อุดรธานี", lat: 17.41, lng: 102.78, risk: "medium", pm25: 64, water: "Safe", chemical: 52, disease: "ภูมิแพ้", prediction: "17 วัน", population: 567 },
  { id: 54, name: "บ้านเลย", province: "เลย", lat: 17.49, lng: 101.73, risk: "high", pm25: 86, water: "Moderate", chemical: 58, disease: "ระบบหายใจ", prediction: "12 วัน", population: 345 },
  { id: 55, name: "บ้านหนองคาย", province: "หนองคาย", lat: 17.88, lng: 102.74, risk: "medium", pm25: 48, water: "Moderate", chemical: 42, disease: "ท้องร่วง", prediction: "20 วัน", population: 389 },
  { id: 56, name: "บ้านมหาสารคาม", province: "มหาสารคาม", lat: 16.18, lng: 103.30, risk: "medium", pm25: 57, water: "Moderate", chemical: 50, disease: "โรคตา", prediction: "19 วัน", population: 389 },
  { id: 57, name: "บ้านร้อยเอ็ด", province: "ร้อยเอ็ด", lat: 16.05, lng: 103.65, risk: "medium", pm25: 56, water: "Safe", chemical: 45, disease: "โรคผิวหนัง", prediction: "22 วัน", population: 456 },
  { id: 58, name: "บ้านกาฬสินธุ์", province: "กาฬสินธุ์", lat: 16.43, lng: 103.51, risk: "medium", pm25: 62, water: "Moderate", chemical: 52, disease: "ภูมิแพ้", prediction: "17 วัน", population: 334 },
  { id: 59, name: "บ้านสกลนคร", province: "สกลนคร", lat: 17.15, lng: 104.13, risk: "high", pm25: 55, water: "Moderate", chemical: 60, disease: "โรคผิวหนัง", prediction: "14 วัน", population: 256 },
  { id: 60, name: "บ้านนครพนม", province: "นครพนม", lat: 17.39, lng: 104.78, risk: "critical", pm25: 38, water: "Unsafe", chemical: 72, disease: "โรคฉี่หนู", prediction: "7 วัน", population: 487 },
  { id: 61, name: "บ้านมุกดาหาร", province: "มุกดาหาร", lat: 16.54, lng: 104.72, risk: "high", pm25: 52, water: "Unsafe", chemical: 66, disease: "โรคฉี่หนู", prediction: "9 วัน", population: 312 },
  { id: 62, name: "บ้านบึงกาฬ", province: "บึงกาฬ", lat: 18.36, lng: 103.65, risk: "medium", pm25: 45, water: "Safe", chemical: 38, disease: "ท้องร่วง", prediction: "23 วัน", population: 189 },
  // ── ภาคใต้ ──
  { id: 63, name: "บ้านชุมพร", province: "ชุมพร", lat: 10.49, lng: 99.18, risk: "medium", pm25: 43, water: "Moderate", chemical: 38, disease: "ไข้เลือดออก", prediction: "24 วัน", population: 423 },
  { id: 64, name: "บ้านระนอง", province: "ระนอง", lat: 9.96, lng: 98.63, risk: "low", pm25: 20, water: "Safe", chemical: 14, disease: "ต่ำ", prediction: "—", population: 198 },
  { id: 65, name: "บ้านสุราษฎร์", province: "สุราษฎร์ธานี", lat: 9.14, lng: 99.33, risk: "medium", pm25: 39, water: "Safe", chemical: 32, disease: "โรคผิวหนัง", prediction: "—", population: 534 },
  { id: 66, name: "บ้านพังงา", province: "พังงา", lat: 8.45, lng: 98.53, risk: "low", pm25: 17, water: "Safe", chemical: 11, disease: "ต่ำ", prediction: "—", population: 223 },
  { id: 67, name: "บ้านภูเก็ต", province: "ภูเก็ต", lat: 7.88, lng: 98.39, risk: "low", pm25: 22, water: "Safe", chemical: 10, disease: "ต่ำ", prediction: "—", population: 612 },
  { id: 68, name: "บ้านกระบี่", province: "กระบี่", lat: 8.09, lng: 98.91, risk: "low", pm25: 15, water: "Safe", chemical: 10, disease: "ต่ำ", prediction: "—", population: 367 },
  { id: 69, name: "บ้านนครศรี", province: "นครศรีธรรมราช", lat: 8.43, lng: 99.96, risk: "low", pm25: 22, water: "Safe", chemical: 20, disease: "ต่ำ", prediction: "—", population: 712 },
  { id: 70, name: "บ้านตรัง", province: "ตรัง", lat: 7.56, lng: 99.61, risk: "medium", pm25: 41, water: "Safe", chemical: 35, disease: "ภูมิแพ้", prediction: "25 วัน", population: 334 },
  { id: 71, name: "บ้านพัทลุง", province: "พัทลุง", lat: 7.62, lng: 100.07, risk: "medium", pm25: 46, water: "Moderate", chemical: 42, disease: "ท้องร่วง", prediction: "20 วัน", population: 312 },
  { id: 72, name: "บ้านสตูล", province: "สตูล", lat: 6.62, lng: 100.07, risk: "low", pm25: 16, water: "Safe", chemical: 12, disease: "ต่ำ", prediction: "—", population: 256 },
  { id: 73, name: "บ้านสงขลา", province: "สงขลา", lat: 7.19, lng: 100.60, risk: "low", pm25: 18, water: "Safe", chemical: 15, disease: "ต่ำ", prediction: "—", population: 812 },
  { id: 74, name: "บ้านปัตตานี", province: "ปัตตานี", lat: 6.87, lng: 101.25, risk: "high", pm25: 56, water: "Unsafe", chemical: 63, disease: "โรคผิวหนัง", prediction: "13 วัน", population: 445 },
  { id: 75, name: "บ้านยะลา", province: "ยะลา", lat: 6.54, lng: 101.28, risk: "high", pm25: 53, water: "Unsafe", chemical: 60, disease: "ไข้เลือดออก", prediction: "11 วัน", population: 389 },
  { id: 76, name: "บ้านนราธิวาส", province: "นราธิวาส", lat: 6.43, lng: 101.82, risk: "critical", pm25: 36, water: "Unsafe", chemical: 70, disease: "โรคฉี่หนู", prediction: "8 วัน", population: 512 },
  { id: 77, name: "บ้านนครนายก", province: "นครนายก", lat: 14.20, lng: 101.21, risk: "low", pm25: 28, water: "Safe", chemical: 15, disease: "ต่ำ", prediction: "—", population: 257 },
];
