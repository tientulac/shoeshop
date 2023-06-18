import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-new',
  templateUrl: './create-new.component.html',
  styleUrls: ['./create-new.component.scss']
})
export class CreateNewComponent extends BaseComponent implements OnInit {

  index = 0;
  tabs = [
    {
      name: 'Hóa đơn 1',
    }
  ];
  selectedOption: any;
  waitingPayment: any;
  paymentMethod: any;
  listDistrictFilter: any;
  listWardFilter: any;
  totalPayment: any = 0;
  full_name: string = '';
  closeTab({ index }: { index: number }): void {
    this.tabs.splice(index, 1);
  }

  newTab(): void {
    if (this.tabs.length > 4) {
      this.toastr.warning('Bạn chỉ được tạo tối đa 5 hóa đơn');
    }
    else {
      let tab = {
        name: 'Hóa đơn ' + (this.tabs.length + 1),
      };
      this.tabs.push(
        tab
      );
      this.refreshOrderInfo();
      this.orderInfo.order_code = `HD${this.date.getDate()}${this.date.getMonth() + 1}${this.date.getFullYear()}${Math.random()}`;
      this.index = this.tabs.length - 1;
    }
  }

  ngOnInit(): void {
    this.getListCity();
    this.getListProduct(null);
    this.getListAccount(null);
    this.refreshOrderInfo();
    this.getListAllProduct();
    this.orderInfo.order_code = `HD${this.date.getDate()}${this.date.getMonth() + 1}${this.date.getFullYear()}${Math.random()}`;
    const data = localStorage.getItem('UserInfo');
    if (data) {
      const account = JSON.parse(data);
      this.full_name = account.full_name;
    }
  }

  selectCity() {
    this.getListDistrict({ province_id: this.citySelected });
    this.orderInfo.id_city = this.citySelected;
  }

  selectDistrict() {
    this.getListWard({ district_id: this.districtSelected });
    this.orderInfo.id_district = this.districtSelected;
  }

  selectWard() {
    this.orderInfo.id_ward = this.townSelected;
  }

  addToCart(): boolean {
    if (this.product_code) {
      this.productFilter = this.listAllProduct.filter((x: any) => x.product_code == this.product_code);
    }
    if (this.product_name) {
      this.productFilter = this.listAllProduct.filter((x: any) => x.product_name.toLowerCase().includes(this.product_name));
    }
    if (this.size_search) {
      this.productFilter = this.listAllProduct.filter((x: any) => x.size == this.size_search);
    }
    if (this.colorInput) {
      this.productFilter = this.listAllProduct.filter((x: any) => x.color == this.colorInput);
    }
    let attributeCart = this.listProductCart?.map((x: any) => x.product_attribue_id) ?? [];
    console.log(attributeCart);
    if (this.listProductCart.filter((x: any) => x.product_code == this.product_code && x.size == this.size_search && x.color == this.colorInput).length > 0) {
      alert('Sản phẩm đã được thêm vào giỏ hàng');
      return false;
    }
    if (this.productFilter) {
      this.productFilter.forEach((p: any) => {
        p.amountCart = 1;
        p.totalPayment = 0;
        p.totalPayment = (p.price * p.amountCart);
        this.listProductCart.push(p);
      })
      this.totalPayment = this.listProductCart?.filter((x: any) => x.checked == true)?.map((o: any) => o.totalPayment)?.reduce((a: any, c: any) => { return a + c }) ?? 0;
    }
    else {
      this.toastr.warning('Không tìm thấy sản phẩm nào phù hợp');
    }
    return true;
  }

  deleteCart(data: any) {
    this.listProductCart = this.listProductCart.filter((x: any) => x.product_id != data.product_id);
    this.totalPayment -= data.totalPayment;
  }

  changeAmount(data: any) {
    data.totalPayment = data.price * data.amountCart;
    if (!data.checked) {
      this.totalPayment -= data.totalPayment;
    }
    this.totalPayment = this.listProductCart.filter((x: any) => x.checked == true).map((o: any) => o.totalPayment).reduce((a: any, c: any) => { return a + c });
  }

  createOrder() {
    if (this.orderInfo.status) {
      this.orderInfo.status = 5
    } else {
      this.orderInfo.status = 3
    }
    this.orderInfo.seller = this.full_name;
    this.orderInfo.total = this.totalPayment;
    this.orderInfo.order_item = JSON.stringify(this.listProductCart);
    this.orderInfo.type = 2;
    this.orderService.createOrderInfor(this.orderInfo).subscribe(
      (res: any) => {
        if (res.status == 200) {
          this.toastr.success('Thành công !');
          this.refreshOrderInfo();
        }
        else {
          this.toastr.warning('Thất bại !');
        }
      }
    );
  }
}
