use dotenv::dotenv;
use proxmox_client::add;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let _proxmox_user = std::env::var("PROXMOX_RUST_USER").expect("PROXMOX_USER is not set");
    let _proxmox_password = std::env::var("PROXMOX_RUST_PASSWORD").expect("PROXMOX_PASSWORD is not set");
    let _proxmox_realm = std::env::var("PROXMOX_RUST_REALM").expect("PROXMOX_REALM is not set");

    let sum = add(2, 2);

    println!("2 + 2 = {}", sum);
}