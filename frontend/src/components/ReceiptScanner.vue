<script setup>
import { ref } from 'vue';
import { createWorker } from 'tesseract.js';

const emit = defineEmits(['extracted']);

const isScanning = ref(false);
const progress = ref(0);
const previewImage = ref(null);
const showCamera = ref(false);
const videoRef = ref(null);
const canvasRef = ref(null);
const stream = ref(null);
const isDragging = ref(false);
const fileInputRef = ref(null);
const currentImageFile = ref(null); // Store the actual file

const handleDragEnter = (e) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (e) => {
  e.preventDefault();
  isDragging.value = false;
};

const handleDragOver = (e) => {
  e.preventDefault();
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragging.value = false;
  
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    processFile(file);
  } else {
    alert('Please drop an image file (PNG, JPG, WEBP)');
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  processFile(file);
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const processFile = (file) => {
  currentImageFile.value = file; // Store the file
  
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.value = e.target.result;
    processImage(e.target.result);
  };
  reader.readAsDataURL(file);
};

const startCamera = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    showCamera.value = true;
    
    setTimeout(() => {
      if (videoRef.value) {
        videoRef.value.srcObject = stream.value;
      }
    }, 100);
  } catch (error) {
    console.error('Error accessing camera:', error);
    alert('Unable to access camera. Please grant permission or use file upload.');
  }
};

const capturePhoto = () => {
  const video = videoRef.value;
  const canvas = canvasRef.value;
  
  if (!video || !canvas) return;
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  
  const imageData = canvas.toDataURL('image/jpeg');
  previewImage.value = imageData;
  
  // Convert base64 to File object
  fetch(imageData)
    .then(res => res.blob())
    .then(blob => {
      currentImageFile.value = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
    });
  
  stopCamera();
  processImage(imageData);
};

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
  showCamera.value = false;
};

const processImage = async (imageData) => {
  isScanning.value = true;
  progress.value = 0;

  try {
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          progress.value = Math.round(m.progress * 100);
        }
      }
    });

    const { data: { text } } = await worker.recognize(imageData);
    await worker.terminate();

    const extractedData = parseReceiptText(text);
    
    // Emit both extracted data AND the image file
    emit('extracted', {
      ...extractedData,
      imageFile: currentImageFile.value,
      imagePreview: imageData
    });

  } catch (error) {
    console.error('OCR Error:', error);
    alert('Failed to process receipt. Please try again.');
  } finally {
    isScanning.value = false;
    progress.value = 0;
  }
};

const parseReceiptText = (text) => {
  console.log('OCR Text:', text);

  // Extract amount
  const amountPatterns = [
    /\$?\s*(\d+[.,]\d{2})/g,
    /total[:\s]+\$?\s*(\d+[.,]\d{2})/gi,
    /amount[:\s]+\$?\s*(\d+[.,]\d{2})/gi
  ];

  let amount = null;
  for (const pattern of amountPatterns) {
    const matches = text.matchAll(pattern);
    const amounts = Array.from(matches).map(m => parseFloat(m[1].replace(',', '.')));
    if (amounts.length > 0) {
      amount = Math.max(...amounts);
      break;
    }
  }

  // Extract date
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})[,\s]+(\d{4})/i
  ];

  let date = null;
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        if (match[0].includes('/') || match[0].includes('-')) {
          const parts = match[0].split(/[\/\-]/);
          if (parts[0].length === 4) {
            date = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          } else {
            const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
            date = `${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
        }
      } catch (e) {
        console.error('Date parsing error:', e);
      }
      break;
    }
  }

  // Extract merchant
  const lines = text.split('\n').filter(line => line.trim().length > 3);
  let merchant = lines[0]?.trim() || '';
  merchant = merchant.replace(/[^a-zA-Z0-9\s&'-]/g, '').trim();

  // Extract items
  const items = [];
  const itemPattern = /(.+?)\s+\$?\s*(\d+[.,]\d{2})/;
  
  lines.forEach(line => {
    const match = line.match(itemPattern);
    if (match && match[1].length > 2) {
      const itemName = match[1].trim();
      const itemPrice = parseFloat(match[2].replace(',', '.'));
      
      if (!itemName.toLowerCase().includes('total') && 
          !itemName.toLowerCase().includes('tax') &&
          !itemName.toLowerCase().includes('change')) {
        items.push({ name: itemName, price: itemPrice });
      }
    }
  });

  return {
    amount: amount || 0,
    date: date || new Date().toISOString().split('T')[0],
    merchant: merchant,
    items: items,
    rawText: text
  };
};

const clearPreview = () => {
  previewImage.value = null;
  currentImageFile.value = null;
};
</script>

<template>
  <!-- Template stays the same -->
  <div class="space-y-4">
    <div v-if="!previewImage" class="space-y-4">
      
      <div 
        class="relative border-2 border-dashed rounded-lg p-8 transition-all duration-200"
        :class="isDragging 
          ? 'border-blue-500 bg-blue-50 scale-105' 
          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        @dragover="handleDragOver"
        @drop="handleDrop"
      >
        <div class="text-center">
          <div class="mb-4">
            <svg 
              class="mx-auto h-16 w-16 transition-colors duration-200" 
              :class="isDragging ? 'text-blue-500' : 'text-gray-400'"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div class="space-y-2">
            <p 
              class="text-lg font-semibold transition-colors duration-200" 
              :class="isDragging ? 'text-blue-600' : 'text-gray-700'"
            >
              {{ isDragging ? 'Drop your receipt here!' : 'Drag & Drop Receipt Image' }}
            </p>
            <p class="text-sm text-gray-500">
              or click the button below to browse files
            </p>
            <p class="text-xs text-gray-400 mt-1">
              Supports: PNG, JPG, WEBP (Max 5MB)
            </p>
          </div>

          <div 
            v-if="isDragging" 
            class="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse pointer-events-none"
          ></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          @click="triggerFileInput"
          type="button"
          class="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2 font-medium shadow-md hover:shadow-lg"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Upload Image</span>
        </button>

        <button
          @click="startCamera"
          type="button"
          class="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2 font-medium shadow-md hover:shadow-lg"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Use Camera</span>
        </button>
      </div>

      <input 
        ref="fileInputRef"
        type="file" 
        class="hidden" 
        accept="image/*" 
        @change="handleFileUpload" 
      />
    </div>

    <div v-if="showCamera" class="space-y-3">
      <div class="relative bg-black rounded-lg overflow-hidden shadow-xl">
        <video ref="videoRef" autoplay playsinline class="w-full h-auto"></video>
        <canvas ref="canvasRef" class="hidden"></canvas>
        
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute inset-4 border-2 border-white/50 rounded-lg"></div>
          <div class="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30"></div>
          <div class="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/30"></div>
        </div>
      </div>
      
      <div class="flex space-x-3">
        <button
          @click="capturePhoto"
          type="button"
          class="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-md"
        >
          Capture Photo
        </button>
        <button
          @click="stopCamera"
          type="button"
          class="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium shadow-md"
        >
          Cancel
        </button>
      </div>
    </div>

    <div v-if="previewImage" class="space-y-3">
      <div class="relative rounded-lg overflow-hidden shadow-xl border-2 border-gray-300">
        <img :src="previewImage" alt="Receipt preview" class="w-full" />
        <button
          v-if="!isScanning"
          @click="clearPreview"
          type="button"
          class="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="isScanning" class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <svg class="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm font-medium text-blue-900">🔍 Scanning receipt...</span>
          </div>
          <span class="text-sm font-bold text-blue-700">{{ progress }}%</span>
        </div>
        
        <div class="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
          <div 
            class="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out" 
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        
        <p class="text-xs text-blue-700 text-center">
          Please wait while we extract data from your receipt...
        </p>
      </div>
    </div>
  </div>
</template>
