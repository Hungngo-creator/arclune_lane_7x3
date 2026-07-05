import os
import re

# regex quét các kiểu khai báo hàm
func_pattern = re.compile(r'(function\s+\w+|const\s+\w+\s*=\s*\(|^\s*\w+\s*\(.*\)\s*\{)')

print("🤖 đang quét các file js trong arclune_lane_7x3...")

# file kết quả sẽ được tạo ngay tại thư mục arclune_lane_7x3 luôn cho gọn
output_path = os.path.join('arclune_lane_7x3', 'mapping_goc.txt')

with open(output_path, 'w', encoding='utf-8') as outfile:
    # chỉ định quét đúng thư mục game của bạn
    for root, dirs, files in os.walk('arclune_lane_7x3'):
        # bỏ qua các thư mục rác
        if 'node_modules' in root or '.git' in root or 'dist' in root:
            continue
            
        for file in files:
            # né file bundle app.js ra
            if file.endswith('.js') and file != 'app.js':
                file_path = os.path.join(root, file)
                outfile.write(f"\n📁 file: {file_path}\n")
                outfile.write("-" * 40 + "\n")
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        for line_num, line in enumerate(f, 1):
                            if func_pattern.search(line):
                                outfile.write(f"  [dòng {line_num}] {line.strip()}\n")
                except:
                    pass

print("✅ xong rồi! file mapping_goc.txt đã nằm trong thư mục arclune_lane_7x3 rồi nhé.")
