#!/data/data/com.termux/files/usr/bin/sh
echo "--- Đang hồi sinh Termux cho ní... ---"
pkg update -y && pkg upgrade -y
pkg install nodejs git openssh -y
termux-setup-storage
git config --global user.email "ngo431228@gmail.com"
git config --global user.name "Hungngo-creator"
git config --global credential.helper store
echo "--- Đã xong Node, Git và ID. Giờ tạo lại SSH Key... ---"
ssh-keygen -t rsa -b 4096 -C "ngo431228@gmail.com" -f ~/.ssh/id_rsa -N ""
cat ~/.ssh/id_rsa.pub
echo "--- Ní copy mã SSH trên dán lên GitHub nhé! ---"
