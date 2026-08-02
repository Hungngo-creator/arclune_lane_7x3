#!/data/data/com.termux/files/usr/bin/sh

echo "=== Khôi phục Termux cho Arclune ==="

pkg update -y
pkg upgrade -y
pkg install nodejs git openssh -y

git config --global user.name "Hungngo-creator"
git config --global user.email "ngo431228@gmail.com"

mkdir -p ~/.ssh

if [ ! -f ~/.ssh/id_ed25519 ]; then
    ssh-keygen -t ed25519 \
        -C "ngo431228@gmail.com" \
        -f ~/.ssh/id_ed25519 \
        -N ""

    echo "SSH key mới:"
    cat ~/.ssh/id_ed25519.pub
    echo "Hãy thêm key trên vào GitHub."
else
    echo "SSH key đã tồn tại, không tạo lại."
fi

echo "=== Hoàn tất ==="