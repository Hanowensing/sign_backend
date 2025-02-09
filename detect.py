from ultralytics import YOLO

# YOLOv8 모델 로드 (기본 객체 탐지 모델)
model = YOLO("yolov8n.pt")  # 사전 학습된 YOLOv8 모델

# 이미지 파일 입력 (YOLO 실행할 이미지 경로)
image_path = "사인볼.jpeg"  # 이미지 파일명 (같은 폴더에 있어야 함)

# YOLO 객체 탐지 실행
results = model(image_path)

# 결과 출력
results.show()  # 결과 시각화
results.save("yolo_detected.png")  # 검출된 이미지 저장

print("검출된 이미지 저장 완료: yolo_detected.png")
