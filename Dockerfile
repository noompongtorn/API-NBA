# ใช้ Node.js 20 เป็น base image
FROM node:20

# ตั้ง working directory
WORKDIR /app

# คัดลอก package.json และ lock file
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอก source code ทั้งหมด
COPY . .

# ระบุพอร์ตที่แอปรัน (3006)
EXPOSE 3006

# สั่งรันแอป (ไฟล์หลักของคุณคือ index.js)
CMD ["node", "src/index.js"]
